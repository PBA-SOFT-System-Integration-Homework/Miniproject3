var amqp = require('amqplib/callback_api');
const fetch = require('node-fetch');

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
function start() {

    amqp.connect(process.env.RABBITMQ_QUEUE_INTERNAL, function (error, connection) {
        if (error) {
            console.error("[AMQP]", error.message);
            return setTimeout(start, 1000);
        }


        connection.on("error", function (error) {
            if (error.message !== "Connection closing") {
                console.error("[AMQP] connection error", error.message);
            }
        });
        connection.on("close", function () {
            console.error("[AMQP] reconnecting");
            return setTimeout(start, 1000);
        });

        console.log("[AMQP] connected");
        amqpConn = connection;

        whenConnected();
    });
}

function whenConnected() {
    createChannel();
}


function createChannel() {
    amqpConn.createChannel(function (error, channel) {
        const queue = 'car_list_request';

        channel.assertQueue(queue, {
            durable: true
        });

        channel.prefetch(1);

        channel.consume(queue, async function (msg) {
            const filter = JSON.parse(msg.content.toString());
            const replyTo = msg.properties.replyTo;

            let carList = [];
            await fetch(process.env.JSON_DATA_URL + '/car')
                .then(res => res.json())
                .then(res => {
                    carList = res
                })
            await fetch(process.env.TEXT_DATA_URL + '/car')
                .then(res => res.text())
                .then(text => {
                    const formattedList = convertTxtContentToArray(text);
                    carList = carList.concat(formattedList);
                })
            // check if numberOfSeats is provided else set it to 0;
            if (!filter.numberOfSeats) filter.numberOfSeats = 0;

            carList = carList.filter(c => {
                // filter seats (default value is 0 so all will pass without provided value)
                let match = (c.number_of_seats >= filter.numberOfSeats);

                // filter by year
                if (filter.year) match = (c.year >= filter.year)
                
                //filter by make if filter is present
                if (filter.make) match = (c.make.toLowerCase() = filter.make.toLowerCase());

                // filter by type if present
                if (filter.carTypeName) match = (c.car_type_name.toLowerCase() === filter.carTypeName.toLowerCase());

                return match;
            });

            //old filter
            // carList = carList.filter(c => c.make === filter.make && c.year >= filter.year);
            channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(carList)));
            channel.ack(msg)
        }, {
            noAck: false
        });
    });
}

function convertTxtContentToArray(data) {
    const txtData = data.toString().split('\n').map(function (el) { return el.replace("\r", "").split(","); });
    const headings = txtData.shift(); // removes and returns the headings of the cars ['id,make,model,year,vin_number']

    return txtData.map(function (el) {
        const obj = {};
        for (var i = 0; i < el.length; i++) {
            obj[headings[i]] = el[i]
        }
        return obj;
    });
}

start();

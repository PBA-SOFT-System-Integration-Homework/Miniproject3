var amqp = require('amqplib/callback_api');
const fetch = require('node-fetch');

// if the connection is closed or fails to be established at all, we will reconnect
var amqpConn = null;
function start() {

    amqp.connect('amqp://rabbitmq:5672', function (error, connection) {
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
            await fetch('http://localhost:3001/car')
                .then(res => res.json())
                .then(res => {
                    carList = res
                })
            await fetch('http://localhost:3002/car')
                .then(res => res.text())
                .then(text => {
                    const formattedList = convertTxtContentToArray(text);
                    carList = carList.concat(formattedList);
                })
            carList = carList.filter(c => c.make === filter.make && c.year >= filter.year);
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
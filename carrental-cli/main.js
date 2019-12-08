var amqp = require('amqplib/callback_api');
const inquirer = require('inquirer');
let run = true;
let cars = [];


function createResponseQueue(userInput) {
    amqp.connect('amqp://localhost:5672', function (error, connection) {
        if (error) {
            throw error;
        }
        connection.createChannel(function (error1, channel) {
            if (error1) throw error1;

            let response_queue = '';

            channel.assertQueue('', {
                exclusive: true,
            }, (err, ok) => {
                response_queue = ok.queue

                channel.sendToQueue('car_list_request', Buffer.from(userInput), {
                    replyTo: response_queue
                });
                channel.consume(response_queue, (msg) => {
                    cars = JSON.parse(msg.content.toString());
                    channel.ack(msg)
                });
            });
        });
    });
}


function main() {
    const markQuestion = [
        {
            type: 'list',
            choices: ['Ford', 'Volvo', 'Mercedes-Benz', 'Volkswagen', 'Audi', 'Lexus', 'BMW'],
            name: 'make',
            message: "'Which make of car do you wish to preview?'"
        },
        {
            type: 'input',
            name: 'year',
            message: "Cars newer than year? (ex. 2000)"
        },
    ];
    inquirer.prompt(markQuestion)
        .then(answer => {

            const filter = { make: answer.make, year: answer.year };
            createResponseQueue(JSON.stringify(filter));
            setTimeout(() => {
                if (cars.length === 0) {
                    console.log('No car of this type available, Goodbye!');
                    process.exit(1);
                }
                cars.forEach(c => console.log(`ID: ${c.id} Make: ${c.make} Year: ${c.year} Model: ${c.model} `))
                askForID();
            }, 1000);
        })
}

function askForID() {
    const idQuestion = [
        {
            type: 'input',
            name: 'id',
            message: "Which make of car do you wish to book? (insert the id)"
        },
        {
            type: 'input',
            name: 'name',
            message: "What is your name?"
        },
        {
            type: 'input',
            name: 'email',
            message: "What is your email?"
        }

    ];
    inquirer.prompt(idQuestion)
        .then(answer => {
            const car = cars.find(c => c['id'] == Number(answer.id));
            console.log(`You chose: ${JSON.stringify(car)}`);
            const booking = { car: car, name: answer.name, email: answer.email };
            bookCar(booking);
            console.log('Sent for approval to carrental');
            console.log('Thank you come again');
            console.log('Press Ctrl+C to terminate')
        })
}

function bookCar(booking) {
    const q = 'car_bookings';

        amqp.connect('amqp://localhost:5672', function (err, conn) {
            if (err) console.log(err);

            conn.createChannel(on_open);

            function on_open(err1, ch) {
                if (err1) console.log(err1);
                ch.assertQueue(q);
                let msg = JSON.stringify(booking);
                ch.sendToQueue(q, Buffer.from(msg));
            }
        });
}

// RUN THE STUFFS
main();
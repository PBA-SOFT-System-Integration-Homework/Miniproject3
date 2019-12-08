var open = require('amqplib').connect('amqp://167.172.98.125:5672');

let q = 'car_bookings';
open.then(function (conn) {
    return conn.createChannel();
}).then(function (ch) {
    return ch.assertQueue(q).then(function (ok) {
        return ch.consume(q, function (msg) {
            if (msg !== null) {
                console.log(msg.content.toString());
                ch.ack(msg);
            }
        });
    });
}).catch(console.warn); 
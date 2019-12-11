const express = require('express')
const fs = require('fs');
var bodyParser = require('body-parser')
var open = require('amqplib').connect(process.env.RABBITMQ_QUEUE_INTERNAL);
const app = express()
const PORT = 3002

app.use(bodyParser.json())

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/car', (req, res, next) => {
    fs.readFile('./data/cars.txt', (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500)
            next();
        }
        const resData = data.toString();
        res.send(resData);
    })
})

app.post('/mechanicJob', function (req, res) {
    let job = req.body.job
    let q = 'mechanic_tasks';
    open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        return ch.assertQueue(q).then(function(ok) {
          return ch.sendToQueue(q, Buffer.from(job));
        });
      }).catch(console.warn);
    res.send("Job delivered to queue")
})

app.get('/mechanicJob', async function (req, res) {
    let q = 'mechanic_tasks';
    open.then(function(conn) {
        return conn.createChannel();
      }).then(function(ch) {
        return ch.assertQueue(q).then(function(ok) {
          return ch.consume(q, function(msg) {
            if (msg !== null) {
              console.log(msg.content.toString());
              ch.ack(msg);
              res.send(msg.content.toString()) // return
            }
          });
        });
      }).catch(console.warn);
})

app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`))
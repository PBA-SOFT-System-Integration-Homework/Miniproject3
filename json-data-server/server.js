
const express = require('express')
const fs = require('fs');
const app = express()
const PORT = 3001

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/car', (req, res, next) => {
    fs.readFile('./data/cars.json', (err, data) => {
        if (err) {
            console.log(err);
            res.sendStatus(500)
            next();
        }
        const resData = data.toString();
        res.send(resData);
    })
})

app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`))

const express = require('express')
const app = express()
const PORT = 3004

const ratingDB = []

app.post('/', (req, res, next) => {
    let feedback = JSON.parse(req.body.feedback)
    ratingDB.push(feedback)
    res.end("Feedback submitted")
})

app.get('/', (req, res, next) => {
    let allFeedback = JSON.stringify(ratingDB)
    res.end(allFeedback)
})

app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`))

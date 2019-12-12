const express = require('express');
const app = express();
const PORT = 3004;

app.use(express.json());

const ratingDB = []


app.get('/questions/rating', (req, res, next) => {
    const ratingQuestions = [
        {
            type: 'list',
            choices: ['*', '**', '***', '****', '*****',],
            name: 'Rating',
            message: "'How would you rate the quality of the service?'"
        },
        {
            type: 'input',
            name: 'Description',
            message: "'Please enter any feedback to your order / the quality of the service'"
        },
    ];

    res.json(ratingQuestions);
});

app.get('/questions/additional', (req, res, next) => {
    const questions = [

        {
            type: 'input',
            name: 'Location',
            message: "'What is your geographical location?'"
        },
        {
            type: 'input',
            name: 'Hello',
            message: "Hello ?"
        },
        {
            type: 'list',
            choices: ['Man', 'Woman', 'Non-binary', 'Prefer not to disclose'],
            name: 'Gender',
            message: "'What is your gender?'"
        },
        {
            type: 'list',
            choices: ['18-24', '25-39', '40-60', '60 plus'],
            name: 'Age',
            message: "'What age range are you in?'"
        }
    ];

    res.json(questions);
})

// POST Feedback 
app.post('/feedback', (req, res, next) => {
    console.log(req.body);
    ratingDB.push(req.body);
    res.end("Feedback submitted")
})

// GET all feedbacks
app.get('/feedback', (req, res, next) => {
    let allFeedback = JSON.stringify(ratingDB)
    res.end(allFeedback)
})

app.listen(PORT, () => console.log(`App listening on PORT: ${PORT}`))

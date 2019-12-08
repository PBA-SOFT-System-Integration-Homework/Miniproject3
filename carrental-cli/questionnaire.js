const inquirer = require('inquirer');
const fetch = require('node-fetch');

// POST_URL = "'https://postman-echo.com/post'"   //DEBUG
POST_URL = "http://localhost:3004";

function main() {

    // const rateService = [
    //     {
    //         type: 'list',
    //         choices: ['*', '**', '***', '****', '*****',],
    //         name: 'Rating',
    //         message: "'How would you rate the quality of the service?'"
    //     },
    //     {
    //         type: 'input',
    //         name: 'Description',
    //         message: "'Please enter any feedback to your order / the quality of the service'"
    //     },
    // ];

    fetch(POST_URL + "/questions/rating")
        .then(res => res.json())
        .then(questions =>
            inquirer.prompt(questions)
                .then(answer => {
                    answer['Date'] = new Date();
                    askToAnswerMoreQUestions(answer);
                })
        )
}


function askToAnswerMoreQUestions(ratedService) {

    const participationChoice = [
        {
            type: 'list',
            choices: ['Yes', 'No'],
            name: 'Participation',
            message: "'Do you want to answer a few follow up questions?'"
        },];
    inquirer.prompt(participationChoice)
        .then(answer => {
            if (answer.Participation == "Yes") {
                additionalQuestions(ratedService);
            } else {
                console.log("Thank you for your participation!")
                post(ratedService);
            }
        });
};

function additionalQuestions(ratedService) {

    // const questions = [

    //     {
    //         type: 'input',
    //         name: 'Location',
    //         message: "'What is your geographical location?'"
    //     },
    //     {
    //         type: 'list',
    //         choices: ['Man', 'Woman', 'Non-binary', 'Prefer not to disclose'],
    //         name: 'Gender',
    //         message: "'What is your gender?'"
    //     },
    //     {
    //         type: 'list',
    //         choices: ['18-24', '25-39', '40-60', '60 plus'],
    //         name: 'Age',
    //         message: "'What age range are you in?'"
    //     }
    // ];
    fetch(POST_URL + "/questions/additional")
        .then(res => res.json())
        .then(questions =>
            inquirer.prompt(questions)
                .then(answer => {
                    console.log("Thank you for your participation!")
                    combinedAnswers = { ...ratedService, ...answer }
                    post(combinedAnswers);
                    console.log('Press Ctrl+C to terminate');
                })
        )

}

function post(whatToPost) {
    fetch(POST_URL+'/feedback', {
        method: 'post',
        body: JSON.stringify(whatToPost),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => {
            // console.log(res);
            // res.json()
        }).catch(err => console.log('an erro occured with the rating service.'))
}

// main();

module.exports = main;
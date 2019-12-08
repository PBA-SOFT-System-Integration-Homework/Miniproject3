# System Integration Mini Project 3: Microservices Architecture

Assignment: [Link](https://github.com/datsoftlyngby/soft2019fall-si/blob/master/docs/Sessions/Week47/Assignment.md)

A further development of [Miniproject2](https://github.com/PBA-SOFT-System-Integration-Homework/Miniproject2)

## Authors Details

- Mathias Bigler (cph-mb493@cphbusiness.dk)
- Stanislav Novitski (cph-sn183@cphbusiness.dk)
- Alexander Winther Hørsted-Andersen (cph-ah353@cphbusiness.dk)

## Requirements & How to run

Start up the application by running:

```
docker-compose up
```

This will load the configuration in

[docker-compose.yml](docker-compose.yml) and thus start up the following microservices:

Microservice     | Description                            | Link                        | Details
---------------- | -------------------------------------- | --------------------------- | --------------------
json-data-server | Nodejs server serving car data as json | <http://localhost:3001/car> |
text-data-server | Nodejs server serving car data as text | <http://localhost:3002/car> |
RabbitMQ         | RabbitMQ message broker                | <http://localhost:15672>    | guest/guest to login
carrental-service | Nodejs service fetching car data from data servers| <http://localhost:3003> |
rating-service | NodeJS microservice REST API | <http://localhost:3004> | Handles user rating questions and additional questions

### Rating-service API endpoints

Endpoint | Method | Result
---------|---------|--------
`/questions/rating` | GET | JSON with rating questions for inquirer
`/questions/additional`| GET | JSON with additional questions inquirer
`/feedback` | POST | JSON with feedback answers
`/feedback` | GET | JSON with all feedback


### Hints
Docker on deployed ubunut server gives an error with user not allowed this is the fix :
```sh 
sudo usermod -aG docker $USER

sudo chmod 755 -R .
```
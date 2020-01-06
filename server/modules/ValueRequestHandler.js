const keys = require('../keys');
const { Pool } = require('pg');
const redis = require('redis');
const util = require('util');

// Redis client setup
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();  


function ValueRequestHandler() {
        // Create database
    this.pgClient = new Pool({
            user: keys.pgUser,
            host: keys.pgHost,
            database: keys.pgDatabase,
            password: keys.pgPassword,
            port: keys.pgPort
    });
    this.pgClient.on('error', () => console.log('Lost PG Connection!'));
    this.pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT PRIMARY KEY, result INT)').catch((err) =>
console.log(err));

    // Redis client setup
    this.redisClient = redis.createClient({
        host: keys.redisHost,
        port: keys.redisPort,
        retry_strategy: () => 1000
    });

    this.redisPublisher = redisClient.duplicate();  

    this.getAllValues = async () => {
        console.log("getting all values");
        const result = await this.pgClient.query('SELECT number from values');
        return result;
    }

    this.getRecentValues = async () => {
        console.log("getting current value")
        return new Promise((resolve, reject) => {
            this.redisClient.hgetall('values', (err, values) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(values);
                }
            });
        });
    }

    this.postValue = async (value) => {

        let hget = util.promisify(this.redisClient.hget).bind(this.redisClient);
        let result = await hget('values', value);

        if (result === null) {
            // queue for the worker, right now this is redis, but changing to be the db
            this.redisClient.hset('values', value, 'Nothing yet!');
            this.redisPublisher.publish('insert', value);
            this.pgClient.query('INSERT INTO values(number) VALUES($1)', [value]);
        }
    }

    this.getResultForValue = (value, callback) => {
        // check cache

        // check db

        // add to db (queue)

        // wait for db trigger

        // add to cache

    }
}

module.exports = {
    ValueRequestHandler: ValueRequestHandler
}
"use strict";
/*jslint node:true*/
let Redis = function() {
    let redis = require('redis'),
        path = require('path'),
        config = require(path.resolve('.') + '/config');
    let redisClient = redis.createClient(config.environment.redis);

    // Function to set the Token with related data
    this.setex = (key, value, timeToLive) => {
        return new Promise((resolve, reject) => {
            // timeToLive in seconds  //24(hr) * 60(min) * 60(sec)--> for one day;
            redisClient.setex(key, timeToLive, JSON.stringify(value), function(error, success) {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
    };
    // Function to set the Token with related data
    this.set = (key, value) => {
        return new Promise((resolve, reject) => {
            redisClient.set(key, JSON.stringify(value), function(error, success) {
                if (error) {
                    reject(error);
                } else {
                    resolve(success);
                }
            });
        });
    };
    // Function to get the Token information
    this.get = (key) => {
        return new Promise((resolve, reject) => {
            redisClient.get(key, function(error, reply) {
                // reply is null when the key is missing
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(reply));
                }
            });
        });
    };
    // Function to expire the Token
    this.del = (token) => {
        return new Promise((resolve, reject) => {
            redisClient.exists(token, function(error, result) {
                if (result === 1) {
                    redisClient.del(token, function(error, success) {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(success);
                        }
                    });
                    return;
                }
                if (result === 0) {
                    reject(new Error("Invalid token"));
                    return;
                }
                if (error) {
                    reject(error);
                    return;
                }
            });
        });
    };
    // Function to check whether the token is live / valid or not
    this.exists = (key) => {
        return new Promise((resolve, reject) => {
            if (key === undefined) {
                reject(new Error("key undefined"));
            }
            redisClient.exists(key, function(error, result) {
                if (result === 1) {
                    resolve(true);
                }
                if (result === 0) {
                    resolve(false);
                }
                if (error) {
                    reject(error);
                }
            });
        });
    };
};
module.exports = new Redis();

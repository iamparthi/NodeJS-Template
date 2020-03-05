"use strict";

/*jslint node:true*/
const crypto = require('crypto'),
    redis = require('./redisHelper'),
    logger = require('./logger'),
    jwt = require('jwt-simple'),
    moment = require("moment"),
    path = require('path'),
    config = require(path.resolve('.') + '/config'),
    _ = require('lodash');

let Utils = function () {
    // Funcation to generate the access token
    const SECRETKEY = 'S3CR#TK#YEwuHX#.I!O>dM*a'
    this.generateJWTToken = (user) => {
        return new Promise((resolve, reject) => {
            try {
                // To generate token
                let expires = expiresIn(config.environment.passwordExpiry);
                let token = jwt.encode({
                    exp: expires
                }, SECRETKEY);

                let genToken = {
                    token: token,
                    tokenType: "JWT",
                    expires: expires,
                    user: user
                }
                logger.info('[utils] [utils] [generateJWTToken] token generate success')
                resolve(genToken);
            }
            catch (err) {
                logger.error('[utils] [utils] [generateJWTToken] error: ', err)
                reject({ "status": "500", "reason": err });
            }
        });
    }

    this.generateChangePasswordToken = (user) => {
        return new Promise((resolve, reject) => {
            try {
                // To generate token
                let expires = expiresIn(config.environment.changePasswordExpiry);
                let token = jwt.encode({
                    exp: expires
                }, SECRETKEY);

                let genToken = {
                    token: token,
                    tokenType: "JWT",
                    expires: expires,
                    user: user
                }
                logger.info('[utils] [utils] [generateChangePasswordToken] token generate success')
                resolve(genToken);
            }
            catch (err) {
                logger.error('[utils] [utils] [generateChangePasswordToken] error: ', err)
                reject(err);
            }
        });
    }

    function expiresIn(minutes) {
        let dateObj = new Date();
        return dateObj.setMinutes(dateObj.getMinutes() + minutes);
    }

    // Function to remove the token from key value store
    this.expireToken = (authHeader) => {
        return new Promise((resolve, reject) => {
            let token;
            if (authHeader) {
                authHeader = authHeader.split(" ");
                token = authHeader[1];
                if (!authHeader[0] || authHeader[0] === undefined) {
                    reject(new Error("Unknown token type"));
                }
                if (!token || token === undefined) {
                    reject(new Error("Missing token in header"));
                }
                return redis.del(token).then((success) => {
                    resolve(success);
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error("Missing authorization in header"));
            }
        });
    }

    // Function to verify the Token
    this.verifyActiveToken = (authHeader) => {
        return new Promise((resolve, reject) => {
            let token;
            if (authHeader) {
                authHeader = authHeader.split(" ");
                token = authHeader[1];
                if (!token || token === undefined) {
                    reject(new Error("Missing token in header"));
                    return;
                }
                redis.get(token).then((result) => {
                    if (result && result.token && result.token == token) {
                        if (result) {
                            let ttl = config.environment.passwordExpiry * 60;
                            redis.setex(token, result, ttl).then((success) => {
                                resolve(result);
                            }).catch((err) => {
                                reject(err);
                            });
                        } else {
                            resolve(false);
                        }
                    } else {
                        reject(new Error('Token not found'));
                    }
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error("Missing authorization"));
            }
        });
    }

    this.getTokenDetail = (authHeader) => {
        return new Promise((resolve, reject) => {
            let token;
            if (authHeader) {
                authHeader = authHeader.split(" ");
                token = authHeader[1];
                if (!token || token === undefined) {
                    reject(new Error("Missing token in header"));
                    return;
                }
                redis.get(token).then((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        resolve(false);
                    }
                }).catch((error) => {
                    reject(error);
                });
            } else {
                reject(new Error("Missing authorization"));
            }
        });
    }

    // Function to create hash from passwd
    this.createHash = (value, type) => {
        type = type || "sha256";
        if (type === "md5") {
            return crypto.createHash(type).update(value).digest("hex");
        }
        return crypto.createHash(type).update(value, "utf8").digest("base64");
    }

    this.getDateRange = (date) => {
        let start = new Date(moment(date).format("YYYY-MM-DD"));
        let end = new Date(moment(date).add(1, 'days').format("YYYY-MM-DD"));

        return {
            start,
            end
        }
    }
};

module.exports = new Utils();

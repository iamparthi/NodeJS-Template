const path = require('path'),
    userModel = require(path.resolve('.') + '/models/mongodb').user,
    sessionController = require('../session/controller'),
    logger = require(path.resolve('.') + '/utils/logger'),
    _ = require('lodash'),
    utils = require(path.resolve('.') + '/utils/utils'),
    redis = require(path.resolve('.') + '/utils/redisHelper'),
    config = require(path.resolve('.') + '/config'),
    bcrypt = require('bcrypt'),
    saltRounds = 10;

const LOGOUT_EVENT = {
    force: "force",
    normal: "normal"
}

let Users = function () {
    this.register = (data) => {
        return this.getUser(data.email).then((result) => {
            logger.info('web | router | api | user | controller | createUser(function) | user found', result);
            if (!result) {
                bcrypt.hash(data.password, saltRounds).then((hash) => {
                    data.email = data.email.toLowerCase();
                    data.password = hash;
                    newUser = userModel(data);
                    newUser.email = data.email;
                    return newUser.save()
                }).then(() => {
                        logger.info('web | router | api | user | createUser(function) | save user success');
                        return Promise.resolve(true);
                    }).catch((err) => {
                    logger.warn('web | router | api | user | createUser(function) | Error: ', err)
                    return Promise.reject({
                        message: err.message ? err.message : "Server error"
                    })
                });
                logger.info('web | router | api | user | createUser(function) | save user success');           
            } else {
                logger.info('web | router | api | user | createUser(function) | Email ID already exists');
                return Promise.reject({
                    message: 'Email ID already exists',
                    code: 'user_exist'
                })
            }
        }).catch((err) => {
            logger.warn('web | router | api | user | createUser(function) | Error: ', err)
            return Promise.reject({
                message: err.message ? err.message : "Server error"
            })
        })
    }

    this.getUser = (email) => {
        return userModel.findOne({
            email: email,
            deleted: {
                $ne: true
            }
        }, {
            _id: 0,
            __v: 0
        });
    }

    this.getUserDetails = (email) => {
        return userModel.findOne({
            email: email
        }, {
            _id: 0,
            __v: 0
        });
    }

    this.login = (email, password) => {
        email = email.toLowerCase();
        return new Promise((resolve, reject) => {
            let token;
            let user;
            return isValidUser(email, password).then((result) => {
                if (!result) {
                    logger.info("web | router | api | user | login(function) | user's role is not supervisor", email);
                    reject({
                        message: "Unauthorized User"
                    })
                }
                user = result;
                // If valid generate token for the user
                logger.info('web | router | api | user | login(function) | user valid', email);
                return logoutSessions(email);
            }).then(() => {
                    logger.info('web | router | api | user | login(function) | logout sessions success', email);
                    return utils.generateJWTToken(user);
                }).then((accessToken) => {
                token = accessToken;
                logger.info('web | router | api | user | login(function) | logout sessions success', email);
                return createSession(token);
            }).then(() => {
                    logger.info('web | router | api | user | login(function) | access token generated', email);
                    // Store the Token in Key Value store.
                    // timeToLive in seconds  //24(hr) * 60(min) * 60(sec)--> for one day;
                    let ttl = config.environment.passwordExpiry * 60;
                    return redis.setex(token.token, token, ttl);
                }).then(() => {
                    logger.info('web | router | api | user | login(function) | login success', email);
                    resolve(token);
                    return;
                }).catch((err) => {
                logger.error('web | router | api | user | login(function) | login service error', err);
                reject({
                    message: err.message ? err.message : "Server error"
                });
                return;
            });
        })
    }

    let createSession = (data) => {
        return sessionController.createSessionLog({
            token: data.token,
            type: data.tokenType,
            email: data.user.email
        });
    }

    let logoutSessions = (email) => {
        return sessionController.activeSessions(email).then((sessions) => {
            let promise = []
            _.each(sessions, (session) => {
                session.logout = true;
                session.logout_at = new Date();
                session.logout_event = LOGOUT_EVENT.force
                session.save();

                promise.push(utils.expireToken("JWT " + session.token));
            });
            return Promise.all(promise).then(() => {
                logger.info('web | router | api | user | logoutSessions(function) | success');
            }).catch((err) => {
                logger.error('web | router | api | user | logoutSessions(function) | session error | ', err);
            });
        }).catch((err) => {
            logger.error('web | router | api | user | logoutSessions(function) | ', err);
        });
    }

    let isValidUser = (email, password) => {
        let userData;
        return new Promise((resolve, reject) => {
            let query = {
                "email": email,
                "deleted": {
                    $ne: true
                }
            }

            return userModel.findOne(query, {
                __v: 0,
                _id: 0,
                createddate: 0
            }).exec().then((result) => {
                if (!result) {
                    logger.info('web | router | api | user | isValidUser(function) | user not found');
                    reject({
                        message: "Invalid user"
                    });
                } else {
                    userData = result;
                    return bcrypt.compare(password, result.password)
                }
            }).then((res) => {
                if (res === true) {
                    logger.info('web | router | api | user | isValidUser(function) user valid');
                    userData.password = undefined;
                    resolve(userData);
                } else {
                    logger.info('web | router | api | user | isValidUser(function) | Invalid password');
                    reject({
                        message: "Invalid user"
                    });
                }
            }).catch((err) => {
                logger.error('web | router | api | user | isValidUser(function) user validation', err);
                reject({
                    message: err.message ? err.message : "Server error"
                });
            });
        });
    }

    this.logout = (token) => {
        return new Promise((resolve, reject) => {
            if (!token || token === '' || token === undefined || token === null) {
                logger.info('web | router | api | user | logOut(function) | Missing token')
                reject({
                    message: "No access token found"
                });
            }
            sessionController.updateSessionLog({
                token: token.split(" ")[1],
                logout: true,
                logout_at: new Date(),
                logout_event: LOGOUT_EVENT.normal
            }).then(() => {
                    logger.info('web | router | api | user | logOut(function) | update session success');
                }).catch((err) => {
                logger.error('web | router | api | user | logOut(function) | session update error', err)
            });
            return utils.expireToken(token).then((success) => {
                if (success) {
                    logger.info('web | router | api | user | logOut(function) | logOut success')
                    resolve(success);
                } else {
                    logger.error('web | router | api | user | logOut(function) | Token could not expire ')
                    reject({
                        message: "Could not logout"
                    });
                }
            }).catch((err) => {
                logger.error('web | router | api | user | logOut(function) | error: ', err)
                reject({
                    message: err.message ? err.message : "Server error"
                });
            });
        })
    }

    this.isUserAvaialable = (email) => {
        return new Promise((resolve, reject) => {
            return userModel.findOne({
                "email": email
            }, {
                __v: 0,
                _id: 0,
                createddate: 0
            }).exec().then((result) => {
                if (!result) {
                    logger.info('web | router | api | user | isUserAvaialable(function) | user not found');
                    resolve(false);
                } else {
                    logger.info('web | router | api | user | isUserAvaialable(function) user valid');
                    result.password = undefined;
                    resolve(true);
                }
            }).catch((err) => {
                logger.error('web | router | api | user | isUserAvaialable(function) user validation', err);
                reject({
                    message: err.message ? err.message : "Server error"
                });
            });
        });
    }
}

module.exports = new Users()

'use strict';
let path = require('path'),
    url = require('url'), // built-in utility
    // config = require(path.resolve('.') + '/config'),
    utils = require(path.resolve('.') + '/utils/utils'),
    logger = require(path.resolve('.') + '/utils/logger');

let Auth = function () {
    /**
     *  Checks if all the parameters required are provided
     */

    this.token = (req, res, next) => {
        let urlPath = url.parse(req.url).pathname;
        req.headers.urlPath = urlPath;
        
        let contentType = req.headers['content-type']
        let method = req.method.trim().toLowerCase()
        let allowedTypesRegEx = [            
            /multipart\/form-data/
        ]
        let allowedContentTypes = [
            "application/json",
        ]

        if (method === "put" || method === "post") {            
            if (allowedTypesRegEx.some(rx => rx.test(contentType)) || allowedContentTypes.indexOf(contentType) > -1) {                
                logger.info(`[middleware] [auth] [token] content-type allowed ${req.method} ${urlPath} ${contentType} `);
            } else {
                logger.warn(`[middleware] [auth] [token] content-type not allowed ${req.method} ${urlPath} ${contentType} `);
                return res.status(500).send({
                    success: false,
                    error: {
                        code: "INVALID-CONTENTTYPE",
                        message: 'Invalid Content-Type'
                    }
                });
            }
        }

        let unauthorizedCode = 'UNAUTHORIZED';
        let skipUrl = [
            '/login',
            '/logout',
            '/register'
        ];    

        if (skipUrl.indexOf(urlPath) > -1 || req.method.trim().toLowerCase() === 'options') {
            logger.info(`[middleware] [auth] [token] skipping url ${req.method} ${urlPath}`);
            next();
            return;
        }

        logger.info(`[middleware] [auth] [token] Token active verification url ${req.method} ${urlPath}`);

        if (req.headers && req.headers["x-access-token"]) {
            utils.verifyActiveToken(req.headers["x-access-token"]).then((result) => {
                if (result) {
                    req.userObj = result.user;
                    next();
                } else {
                    logger.error(`[middleware] [auth] [token] Token is not active  ${urlPath} ::  `);
                    return res.status(401).send({
                        success: false,
                        error: {
                            code: unauthorizedCode,
                            message: 'Token is not active'
                        }
                    });
                }
            }).catch((error) => {
                logger.error(`[middleware] [auth] [token] Error in Token verfication  ${urlPath} ::  `, error);
                return res.status(401).send({
                    success: false,
                    error: {
                        code: unauthorizedCode,
                        message: 'Authorization validation error'
                    }
                });
            });
        } else {
            logger.error(`[middleware] [auth] [token] Invalid authorization header ${urlPath}`);
            return res.status(401).send({
                success: false,
                error: {
                    code: unauthorizedCode,
                    message: "Invalid authorization header"
                }
            });
        }
    }
}

module.exports = new Auth();

const path = require('path'),
    logger = require(path.resolve('.') + '/utils/logger'),
    passwordValidator = require(path.resolve('.') + '/utils/passwordValidator'),
    validator = require('joi');

exports.register = function (req, res, next) {
    logger.info("web | middleware | create user | validating request body ");
    let schema = validator.object().keys({
        email: validator.string().required(),
        password: validator.string().required()
    });

    validator.validate(req.body, schema, { abortEarly: false, allowUnknown: true }, function (err) {
        if (err) {
            logger.warn("web | middleware | create user | validating request body ", err);
            res.status(400).json({ success: false, error: { message: "Validation error" } })
        }
        else {
            let validation = passwordValidator.validate(req.body.password);
            if (validation && validation.strong) {
                next();
            } else {
                logger.warn("web | middleware | create user | password validation error: ", validation);
                res.status(400).json({ success: false, error: validation });
            }
        }
    });
}

exports.login = function (req, res, next) {
    logger.info("web | middleware | login | validating request body");
    let schema = validator.object().keys({
        email: validator.string().required(),
        password: validator.string().required()
    });

    validator.validate(req.body, schema, { abortEarly: false, allowUnknown: true }, function (err) {
        if (err) {
            logger.warn("web | middleware | login | validating request body | Error: ", err);
            res.status(400).json({ success: false, error: { message: "Validation error" } })
        }
        else
            next();
    });
}

exports.logout = function (req, res, next) {
    logger.info("web | middleware | logout | validating request body");
    let schema = validator.object().keys({
        "x-access-token": validator.string().required()
    });

    validator.validate(req.headers, schema, { abortEarly: false, allowUnknown: true }, function (err) {
        if (err) {
            logger.warn("web | middleware | logout | validating request body | Error: ", err);
            res.status(400).json({ success: false, error: { message: "Validation error" } })
        }
        else
            next();
    });
}

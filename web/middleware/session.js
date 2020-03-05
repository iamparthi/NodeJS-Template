const path = require('path'),
      logger = require(path.resolve('.') + '/utils/logger'),
      validator = require('joi');

exports.updateSessionLog = function (req, res, next) {
    logger.info("web | middleware | session | updateSessionLog | validating request body ");
    let schema = validator.object().keys({
        token: validator.string().required(),
        type: validator.string().required(),
        email: validator.string().required(),
        platform: validator.string().required()        
    });

    validator.validate(req.body, schema, {abortEarly: false, allowUnknown: true}, function (err) {
        if (err) {
            logger.warn("web | middleware | session | updateSessionLog | validating request body");
            res.status(400).json({success: false, error: err})
        }
        else
            next();
     });
}

const path = require('path'),
      logger = require(path.resolve('.') + '/utils/logger'),
      controller = require('./controller');

let Session = function () {
    // this.createSessionLog = (req, res) => {
    //     return controller.createSessionLog(req.body, req.userObj).then((result) => {
    //         logger.info('web | router | api | session | createSessionLog(function) | create session success');
    //         res.status(200).json({success: true})
    //     }).catch((err) => {
    //         logger.warn('web | router | api | session | createSessionLog(function) | Error: ', err)
    //         return res.status(400).json({success: false, error: {message: err.message}});
    //     })
    // }
    this.sessions = (req, res) => {
        return controller.sessions().then((result) => {
            logger.info('web | router | api | session | sessions(function) | success');
            res.status(200).json({success: true, payload: result})
        }).catch((err) => {
            logger.warn('web | router | api | session | sessions(function) | Error: ', err)
            return res.status(400).json({success: false, error: {message: err.message}});
        })
    }

    this.updateSessionLog = (req, res) => {
        return controller.updateSessionLog(req.body, req.userObj).then((result) => {
            logger.info('web | router | api | session | updateSessionLog(function) | create session success');
            res.status(200).json({success: true})
        }).catch((err) => {
            logger.warn('web | router | api | session | updateSessionLog(function) | Error: ', err)
            return res.status(400).json({success: false, error: {message: err.message}});
        })
    }
}

module.exports = new Session()

const path = require('path'),
    logger = require(path.resolve('.') + '/utils/logger'),
    controller = require('./controller');

let Users = function () {
    this.register = (req, res) => {
        return controller.register(req.body).then((result) => {
            logger.info('web | router | api | user | register(function) | create user success');
            res.status(200).json({success: true, payload: result})
        }).catch((err) => {
            logger.warn('web | router | api | user | register(function) | Error: ', err)
            return res.status(400).json({success: false, error: {message: err.message}});
        })        
    }

    this.login = (req, res) => {
        return controller.login(req.body.email, req.body.password).then((result) => {
            logger.info('web | router | api | user | login(function) | login success');
            res.status(200).json({ success: true, payload: result })
        }).catch((err) => {
            logger.warn('web | router | api | user | login(function) | Error: ', err)
            return res.status(400).json({ success: false, error: { message: err.message } });
        })
    }

    this.logout = (req, res) => {
        return controller.logout(req.headers["x-access-token"]).then((result) => {
            logger.info('web | router | api | user | logout(function) | login success');
            res.status(200).json({ success: true })
        }).catch((err) => {
            logger.warn('web | router | api | user | logout(function) | Error: ', err)
            return res.status(400).json({ success: false, error: { message: err.message } });
        })
    }
}

module.exports = new Users()

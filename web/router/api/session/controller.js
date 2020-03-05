const path = require('path'),
    sessionlogModel = require(path.resolve('.') + '/models/mongodb').sessionlog,
    logger = require(path.resolve('.') + '/utils/logger'),
    config = require(path.resolve('.') + '/config');

let Session = function () {
    this.createSessionLog = (data, user) => {
        let sessionLog = sessionlogModel(data);
        return sessionLog.save();
    }

    this.updateSessionLog = (data) => {
        return sessionlogModel.update({ token: data.token }, {
            $set: data
        });
    }

    this.sessions = () => {
        return sessionlogModel.find({});
    }

    this.activeSessions = (email) => {
        return sessionlogModel.find({ email: email, logout: { $ne: true } }, { token: 1 });
    }
}

module.exports = new Session()

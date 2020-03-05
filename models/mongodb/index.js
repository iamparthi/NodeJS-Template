let mongoose = require('./connection');

module.exports = {
	user: require('./schema/user')(mongoose),
	sessionlog: require('./schema/sessionlog')(mongoose)
}

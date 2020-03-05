// require the module 
let owasp = require('owasp-password-strength-test');
 
module.exports.validate = (password) => {
    // invoke test() to test the strength of a password 
    return owasp.test(password);
}



let config = {
  port: 7001,
  redis: {
    host: "127.0.0.1",
    port: "6379"
  },
  defaultPassword: "admin",
  forgotPasswordHashTTL: 60, //In Minutes      
  passwordExpiry: 512640, //In Minutes
  changePasswordExpiry: 10, //In Minutes
  origin: "*"
}

module.exports = config;

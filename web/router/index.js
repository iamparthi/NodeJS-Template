const router = require('express').Router()
const middleware = require('../middleware')
const api = require('./api')

// Auth module APIs
router.post('/register', middleware.user.register, api.user.user.register)
router.post('/login', middleware.user.login, api.user.user.login)
router.post('/logout', middleware.user.logout, api.user.user.logout)

module.exports = router

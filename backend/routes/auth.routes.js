const express = require("express")
const {
    registerController,
    loginController,
    logoutController,
    getMeController,
    changePasswordController,
    exportAccountController,
    deleteAccountController
} = require('../controllers/auth.controller')
const identifyUser = require('../middleware/auth.middleware')
const { authLimiter, accountLimiter } = require('../middleware/rateLimit.middleware')

const authRouter = express.Router()

// Brute-force protection for credential writes. Session reads (get-me) and
// logout stay unthrottled so a normal page reload is never blocked.
authRouter.post('/register', authLimiter, registerController)
authRouter.post('/login', authLimiter, loginController)
authRouter.get('/logout', identifyUser, logoutController)
authRouter.get('/get-me', identifyUser, getMeController)

// Sensitive account changes get a stricter window than sign-in writes.
authRouter.patch('/password', accountLimiter, identifyUser, changePasswordController)
authRouter.get('/export', accountLimiter, identifyUser, exportAccountController)
authRouter.delete('/account', accountLimiter, identifyUser, deleteAccountController)

module.exports = authRouter

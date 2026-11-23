const jwt = require('jsonwebtoken')
const blacklistModel = require('../models/blacklist.model')
const userModel = require('../models/user.model')

const identifyUser = async (req, res, next) => {
    const token = req.cookies.token

    if (!token) {
        return res.status(401).json({
            message: 'No Token Provided, Please Login/ Register!'
        })
    }

    try {
        const isTokenBlacklisted = await blacklistModel.exists({ token })

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Invalid Token"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        if (!Number.isInteger(decoded.tokenVersion)) {
            return res.status(401).json({
                message: 'Session ended. Please sign in again.'
            })
        }

        const user = await userModel.findById(decoded.id)

        if (!user || decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
            return res.status(401).json({
                message: 'Session ended. Please sign in again.'
            })
        }

        req.user = decoded
        req.userDoc = user
        return next()
    } catch (err) {
        console.error('identifyUser error:', err.message)
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports = identifyUser

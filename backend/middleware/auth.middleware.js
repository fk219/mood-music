const jwt = require('jsonwebtoken')
const blacklistModel = require('../models/blacklist.model')

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
        req.user = decoded
        return next()
    } catch (err) {
        console.error('identifyUser error:', err.message)
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports = identifyUser

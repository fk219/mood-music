const { rateLimit } = require('express-rate-limit')

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: 'Too many sign-in attempts. Wait a minute and try again.'
        })
    }
})

const demoLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: 'The demo room is getting busy. Wait a minute and try again.'
        })
    }
})

const accountLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: 'Too many account changes. Wait a few minutes and try again.'
        })
    }
})

const moodWriteLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: 'Too many mood check-ins. Give the journal a moment.'
        })
    }
})

const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({
            message: 'The studio accepts five uploads per hour. Try again later.'
        })
    }
})

module.exports = {
    authLimiter,
    demoLimiter,
    accountLimiter,
    moodWriteLimiter,
    uploadLimiter
}

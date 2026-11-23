const express = require('express')
const identifyUser = require('../middleware/auth.middleware')
const { moodWriteLimiter } = require('../middleware/rateLimit.middleware')
const {
    recordMood,
    getMoodSummary,
    clearMoodHistory
} = require('../controllers/mood.controller')

const moodRouter = express.Router()

moodRouter.post('/', moodWriteLimiter, identifyUser, recordMood)
moodRouter.get('/summary', identifyUser, getMoodSummary)
moodRouter.delete('/', moodWriteLimiter, identifyUser, clearMoodHistory)

module.exports = moodRouter

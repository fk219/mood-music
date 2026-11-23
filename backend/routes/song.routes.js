const express = require('express')
const upload = require('../middleware/upload.middleware')
const identifyUser = require('../middleware/auth.middleware')
const requireStudioOwner = require('../middleware/studio.middleware')
const { uploadLimiter } = require('../middleware/rateLimit.middleware')
const { songUpload, getSong, getLibrary } = require('../controllers/song.controller')

const songRouter = express.Router()

songRouter.get('/library', getLibrary)
songRouter.get('/', getSong)
songRouter.post(
    '/',
    uploadLimiter,
    identifyUser,
    requireStudioOwner,
    upload.single('song'),
    songUpload
)

module.exports = songRouter

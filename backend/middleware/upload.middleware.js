const multer = require('multer')

const storage = multer.memoryStorage()
const MAX_UPLOAD_BYTES = 15 * 1024 * 1024
const MP3_MIMETYPES = new Set([
    '',
    'application/octet-stream',
    'audio/mpeg',
    'audio/mp3',
    'audio/x-mpeg',
    'audio/mpeg3',
    'audio/x-mp3',
    'audio/mpg'
])

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        const mimetype = (file.mimetype || '').toLowerCase()
        const isMp3Mime = MP3_MIMETYPES.has(mimetype)
        const isMp3Name = /\.mp3$/i.test(file.originalname || '')

        if (!isMp3Mime || !isMp3Name) {
            const error = new Error('Only MP3 files are supported.')
            error.status = 400
            return callback(error)
        }

        return callback(null, true)
    }
})

module.exports = upload

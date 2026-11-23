const express = require("express")
const cookieParser = require('cookie-parser')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

const authRouter = require('../routes/auth.routes')
const songRouter = require('../routes/song.routes')
const moodRouter = require('../routes/mood.routes')

const app = express()

// Render/other proxies terminate TLS in front of the API. This keeps
// express-rate-limit keyed to the real client IP.
app.set('trust proxy', 1)

app.use(helmet())
app.use(compression())
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:5173,https://moodify.furqankhan.dev'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}))

app.use((req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next()
    const origin = req.headers.origin
    if (origin && !allowedOrigins.includes(origin)) {
        return res.status(403).json({ message: "Origin not allowed." })
    }
    return next()
})

app.use('/api/song', songRouter)
app.use('/api/auth', authRouter)
app.use('/api/mood', moodRouter)


app.get('/', (req, res) => {
    res.send("API's are up and Running")
})

app.use((req, res) => {
    res.status(404).json({ message: 'Not found' })
})

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)

    if (error?.name === 'MulterError') {
        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'MP3 files must be 15 MB or smaller.'
            : `Upload failed: ${error.message}`

        return res.status(400).json({ message })
    }

    if (error?.status && error.status < 500) {
        return res.status(error.status).json({ message: error.message })
    }

    console.error(error)
    return res.status(500).json({ message: 'Something went wrong on the server.' })
})

module.exports = app

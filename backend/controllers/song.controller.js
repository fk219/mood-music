const songModel = require('../models/song.model')
const id3 = require('node-id3')
const storageService = require('../services/storage.service')
const { MOODS, normalizeMood } = require('../utils/mood')

const isMp3Buffer = (buffer) => {
    if (!buffer || buffer.length < 3) return false

    const hasId3Header = buffer.subarray(0, 3).toString('latin1') === 'ID3'
    const hasFrameSync = buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0

    return hasId3Header || hasFrameSync
}

const readTags = (buffer) => {
    try {
        return id3.read(buffer) || {}
    } catch {
        return {}
    }
}

const getCoverArt = (image) => {
    const cover = Array.isArray(image) ? image[0] : image
    const imageBuffer = cover?.imageBuffer

    if (!imageBuffer || !imageBuffer.length) return null

    return {
        buffer: Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer),
        mime: typeof cover.mime === 'string' ? cover.mime : 'image/jpeg'
    }
}

const slugify = (value) => {
    const slug = value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)

    return slug || `track-${Date.now()}`
}

const imageExtension = (mime) => {
    if (mime.includes('png')) return 'png'
    if (mime.includes('webp')) return 'webp'
    if (mime.includes('gif')) return 'gif'
    return 'jpeg'
}

const songUpload = async (req, res) => {
    const mood = normalizeMood(req.body?.mood)

    if (!req.file) {
        return res.status(400).json({
            message: 'Choose an MP3 file to upload.'
        })
    }

    if (!mood) {
        return res.status(400).json({
            message: 'Choose a valid mood: neutral, happy, sad, angry, or surprised.'
        })
    }

    if (!isMp3Buffer(req.file.buffer)) {
        return res.status(400).json({
            message: 'That file is not a valid MP3.'
        })
    }

    const tags = readTags(req.file.buffer)
    const title = typeof tags.title === 'string' ? tags.title.trim() : ''
    const cover = getCoverArt(tags.image)

    if (!title) {
        return res.status(400).json({
            message: 'This MP3 has no ID3 title tag. Add a title in a tag editor and upload it again.'
        })
    }

    if (!cover) {
        return res.status(400).json({
            message: 'This MP3 has no embedded cover art. Add artwork in a tag editor and upload it again.'
        })
    }

    const safeTitle = title.replace(/\s+/g, ' ').slice(0, 180)
    const slug = slugify(safeTitle)
    const stamp = Date.now()

    try {
        const [songFile, posterFile] = await Promise.all([
            storageService.uploadSong({
                buffer: req.file.buffer,
                fileName: `${slug}-${stamp}.mp3`,
                folder: '/moodmusic/songs'
            }),
            storageService.uploadSong({
                buffer: cover.buffer,
                fileName: `${slug}-${stamp}.${imageExtension(cover.mime)}`,
                folder: '/moodmusic/posters'
            })
        ])

        const song = await songModel.create({
            url: songFile.url,
            title: safeTitle,
            posterImage: posterFile.url,
            mood
        })

        return res.status(201).json({
            message: 'Song created successfully',
            song
        })
    } catch (error) {
        console.error('Song upload failed:', error.message)
        return res.status(502).json({
            message: 'The track could not be stored right now. Please try again.'
        })
    }
}

const getSong = async (req, res) => {
    const requestedMood = normalizeMood(req.query.mood) || 'neutral'

    let songs = await songModel.find({ mood: requestedMood }).lean()
    let resolvedMood = requestedMood
    let fallback = false

    if (songs.length === 0 && requestedMood !== 'neutral') {
        songs = await songModel.find({ mood: 'neutral' }).lean()

        if (songs.length > 0) {
            resolvedMood = 'neutral'
            fallback = true
        }
    }

    return res.status(200).json({
        message: 'Song fetched successfully',
        requestedMood,
        resolvedMood,
        fallback,
        song: songs
    })
}

const getLibrary = async (req, res) => {
    const songs = await songModel
        .find({})
        .select('url title posterImage mood')
        .lean()

    const library = Object.fromEntries(MOODS.map((mood) => [mood, []]))

    songs.forEach((song) => {
        const mood = normalizeMood(song.mood) || 'neutral'
        library[mood].push({ ...song, mood })
    })

    return res.status(200).json({
        message: 'Library fetched successfully',
        total: songs.length,
        library
    })
}

module.exports = {
    songUpload,
    getSong,
    getLibrary
}

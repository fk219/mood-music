const mongoose = require('mongoose')
const moodEntryModel = require('../models/moodEntry.model')
const { MOODS, normalizeMood } = require('../utils/mood')

const DAY_MS = 24 * 60 * 60 * 1000
const CAMERA_RECORD_WINDOW_MS = 30 * 1000

const startOfUtcDay = (date) => new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
))

const utcDayKey = (date) => date.toISOString().slice(0, 10)

const emptyCounts = () => Object.fromEntries(MOODS.map((mood) => [mood, 0]))

const recordMood = async (req, res) => {
    const mood = normalizeMood(req.body?.mood)
    const source = req.body?.source

    if (!mood) {
        return res.status(400).json({
            message: 'Choose a valid mood: neutral, happy, sad, angry, or surprised.'
        })
    }

    if (source !== 'camera' && source !== 'manual') {
        return res.status(400).json({
            message: 'A mood entry needs a valid source: camera or manual.'
        })
    }

    if (source === 'camera') {
        const recent = await moodEntryModel
            .findOne({
                user: req.user.id,
                source: 'camera',
                createdAt: { $gte: new Date(Date.now() - CAMERA_RECORD_WINDOW_MS) }
            })
            .sort({ createdAt: -1 })
            .lean()

        if (recent) {
            return res.status(200).json({
                message: 'Camera check-in already recorded recently',
                recorded: false,
                entry: recent
            })
        }
    }

    const entry = await moodEntryModel.create({
        user: req.user.id,
        mood,
        source
    })

    return res.status(201).json({
        message: 'Mood recorded',
        recorded: true,
        entry
    })
}

const getMoodSummary = async (req, res) => {
    const now = new Date()
    const start = new Date(startOfUtcDay(now).getTime() - 6 * DAY_MS)

    const userId = new mongoose.Types.ObjectId(req.user.id)

    const [moodDays, recent] = await Promise.all([
        moodEntryModel.aggregate([
            {
                $match: {
                    user: userId,
                    createdAt: { $gte: start }
                }
            },
            {
                $group: {
                    _id: {
                        mood: '$mood',
                        day: {
                            $dateToString: {
                                format: '%Y-%m-%d',
                                date: '$createdAt',
                                timezone: 'UTC'
                            }
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]),
        moodEntryModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
    ])

    const counts = emptyCounts()
    const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start.getTime() + index * DAY_MS)

        return {
            date: utcDayKey(date),
            total: 0,
            counts: emptyCounts()
        }
    })
    const daysByKey = new Map(days.map((day) => [day.date, day]))

    moodDays.forEach((row) => {
        const mood = row._id?.mood
        const day = daysByKey.get(row._id?.day)

        if (!MOODS.includes(mood) || !day) return

        counts[mood] += row.count
        day.counts[mood] += row.count
        day.total += row.count
    })

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
    const dominantMood = MOODS.reduce((best, mood) => {
        if (counts[mood] > (counts[best] || 0)) return mood
        return best
    }, MOODS[0])

    return res.status(200).json({
        message: 'Mood summary fetched successfully',
        windowDays: 7,
        total,
        counts,
        dominantMood: total > 0 ? dominantMood : null,
        days,
        entries: recent.map((entry) => ({
            id: String(entry._id),
            mood: entry.mood,
            source: entry.source,
            createdAt: entry.createdAt
        }))
    })
}

const clearMoodHistory = async (req, res) => {
    const result = await moodEntryModel.deleteMany({ user: req.user.id })

    return res.status(200).json({
        message: 'Mood history cleared',
        deletedCount: result.deletedCount
    })
}

module.exports = {
    recordMood,
    getMoodSummary,
    clearMoodHistory
}

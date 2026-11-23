const mongoose = require("mongoose")

const moodEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    mood: {
        type: String,
        required: true,
        enum: ["happy", "sad", "angry", "surprised", "neutral"]
    },
    source: {
        type: String,
        required: true,
        enum: ["camera", "manual"]
    }
}, {
    timestamps: true
})

moodEntrySchema.index({ user: 1, createdAt: -1 })

const moodEntryModel = mongoose.model("MoodEntry", moodEntrySchema)

module.exports = moodEntryModel

const mongoose = require('mongoose')

const songSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    posterImage: {
        type: String,   
        required: true
    },
    mood: {
        type: String,
        required: [true, "Mood is Required"],
        enum: {
            values: ["happy", "sad", "angry", "surprised", "neutral"],
            message: "Choose a valid mood"
        }
    }
})

songSchema.index({ mood: 1 })

const songModel = mongoose.model("songs", songSchema)

module.exports = songModel
const mongoose = require("mongoose")

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, 'Token is Required'],
        unique: [true, "Token Already Blackisted"]      
    }
}, {
    timestamps: true
})

// Expired tokens fall out on their own one day after logout.
blacklistSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 })

const blacklistModel = mongoose.model('backlist', blacklistSchema)

module.exports = blacklistModel
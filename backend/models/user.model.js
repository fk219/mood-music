const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is Required"],
        unique: [true, ""]
    },
    email: {
        type: String,
        required: [true, "Email is Required!"],
        unique: [true, "Duplicate Email Found"]
    },
    displayName: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is Required"],
        select: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    tokenVersion: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel
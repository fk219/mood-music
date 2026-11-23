const userModel = require('../models/user.model')
const blacklistModel = require('../models/blacklist.model')
const moodEntryModel = require('../models/moodEntry.model')

const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const DEMO_EMAIL = 'demo@moodify.local'
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 72

const getJoinedAt = (user) => {
    if (user.createdAt) return user.createdAt

    return typeof user._id?.getTimestamp === 'function'
        ? user._id.getTimestamp()
        : null
}

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    email: user.email,
    joinedAt: getJoinedAt(user)
})

const isNonEmptyString = (value) => (
    typeof value === 'string' && value.trim().length > 0
)

const registerController = async (req, res) => {
    const {username, email, password} = req.body

    const userAlreadyExists = await userModel.findOne({
        $or: [
            {username}, {email}
        ]
    })

    if(userAlreadyExists){
        return res.status(400).json({
            Message: userAlreadyExists.email === email
            ? "Email Already Exist. Please Login Instead"
            : "Username Already Exists. Please Login Instead"
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username, 
        email,
        password: hashedPassword
    })

    const token = jwt.sign({
        id: user._id,
        username: user.username,
        tokenVersion: user.tokenVersion ?? 0
    }, process.env.JWT_SECRET, {
        expiresIn: "1d"
    })

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: true })

    res.status(201).json({
        message: "User Registered Successfully!",
        user: toPublicUser(user)
    })
}

const loginController = async (req, res) => {
    const {username, email, password} = req.body

    const user = await userModel.findOne({
        $or: [
            {username},
            {email}
        ]
    }).select("+password")

    if(!user){
        return res.status(401).json({
            message: "Invalid Credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if(!isPasswordValid){
        return res.status(401).json({
            message: "Invalid Credentials"
        })
    }

    const token = jwt.sign({
        id: user._id,
        email: user.email,
        username: user.username,
        tokenVersion: user.tokenVersion ?? 0
    }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    })

    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: true })

    return res.status(200).json({
        message: "user Logged In Successfully",
        user: toPublicUser(user)
    })
}

const logoutController = async (req, res) => {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(400).json({ 
        message: "No active session found" 
        })
    }

    await blacklistModel.updateOne(
      { token },
      { $setOnInsert: { token } },
      { upsert: true }
    )
    res.clearCookie("token")

    return res.status(200).json({ message: "Logout Successfully!" })
  } catch (error) {
    console.error("Logout Error:", error)
    return res.status(500).json({
      message: "Logout failed",
      error: error.message
    })
  }
}

const getMeController = async(req, res) => {
    const user = req.userDoc || await userModel.findById(req.user.id)

    if (!user) {
        return res.status(401).json({
            message: 'Session ended. Please sign in again.'
        })
    }

    const moodEntryCount = await moodEntryModel.countDocuments({ user: user._id })

    res.status(200).json({
        message: "User Fetched Successfully",
        user: {
            ...toPublicUser(user),
            _id: user._id,
            moodEntryCount
        }
    })
}

const changePasswordController = async (req, res) => {
    const { currentPassword, newPassword } = req.body || {}

    if (!isNonEmptyString(currentPassword)) {
        return res.status(400).json({
            message: 'Enter your current password.'
        })
    }

    if (
        typeof newPassword !== 'string' ||
        newPassword.length < PASSWORD_MIN_LENGTH ||
        newPassword.length > PASSWORD_MAX_LENGTH
    ) {
        return res.status(400).json({
            message: 'New password must be 8 to 72 characters.'
        })
    }

    const user = await userModel.findById(req.user.id).select('+password')

    if (!user) {
        return res.status(401).json({
            message: 'Session ended. Please sign in again.'
        })
    }

    if (user.email.toLowerCase() === DEMO_EMAIL) {
        return res.status(403).json({
            message: 'The shared demo account cannot change its password.'
        })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: 'Current password is incorrect.'
        })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    user.tokenVersion = (user.tokenVersion ?? 0) + 1
    await user.save()

    res.clearCookie('token')

    return res.status(200).json({
        message: 'Password updated. All sessions were signed out.'
    })
}

const exportAccountController = async (req, res) => {
    const user = req.userDoc || await userModel.findById(req.user.id)

    if (!user) {
        return res.status(401).json({
            message: 'Session ended. Please sign in again.'
        })
    }

    const entries = await moodEntryModel
        .find({ user: user._id })
        .sort({ createdAt: 1 })
        .lean()

    const payload = {
        exportedAt: new Date().toISOString(),
        account: toPublicUser(user),
        moodEntryCount: entries.length,
        moodEntries: entries.map((entry) => ({
            id: String(entry._id),
            mood: entry.mood,
            source: entry.source,
            createdAt: entry.createdAt
        }))
    }

    const stamp = new Date().toISOString().slice(0, 10)

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader(
        'Content-Disposition',
        `attachment; filename="moodify-account-${stamp}.json"`
    )

    return res.status(200).send(JSON.stringify(payload, null, 2))
}

const deleteAccountController = async (req, res) => {
    const { password } = req.body || {}

    if (!isNonEmptyString(password)) {
        return res.status(400).json({
            message: 'Enter your password to delete the account.'
        })
    }

    const user = await userModel.findById(req.user.id).select('+password')

    if (!user) {
        return res.status(401).json({
            message: 'Session ended. Please sign in again.'
        })
    }

    if (user.email.toLowerCase() === DEMO_EMAIL) {
        return res.status(403).json({
            message: 'The demo account cannot be deleted.'
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(401).json({
            message: 'Password is incorrect.'
        })
    }

    const token = req.cookies.token

    await Promise.all([
        moodEntryModel.deleteMany({ user: user._id }),
        blacklistModel.updateOne(
            { token },
            { $setOnInsert: { token } },
            { upsert: true }
        )
    ])

    await userModel.deleteOne({ _id: user._id })

    res.clearCookie('token')

    return res.status(200).json({
        message: 'Account deleted. Your mood journal was removed and the shared track catalog stays.'
    })
}

module.exports = {
    registerController,
    loginController,
    logoutController,
    getMeController,
    changePasswordController,
    exportAccountController,
    deleteAccountController
}

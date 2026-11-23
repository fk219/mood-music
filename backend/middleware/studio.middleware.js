const userModel = require('../models/user.model')

// Optional owner gate. When STUDIO_EMAIL is unset, any signed-in listener can
// grow the catalog (useful for local demos). Set it in production to reserve
// uploads for the room owner.
const requireStudioOwner = async (req, res, next) => {
    const ownerEmail = (process.env.STUDIO_EMAIL || '').trim().toLowerCase()

    if (!ownerEmail) return next()

    try {
        const user = await userModel.findById(req.user.id).select('email').lean()

        if (!user || user.email.toLowerCase() !== ownerEmail) {
            return res.status(403).json({
                message: 'The studio is reserved for the room owner.'
            })
        }

        return next()
    } catch (error) {
        return next(error)
    }
}

module.exports = requireStudioOwner

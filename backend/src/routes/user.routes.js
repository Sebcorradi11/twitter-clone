import { getProfile, getTweets, getLikes } from '../controllers/user.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function userRoutes(app) {
    app.addHook('preHandler', authenticate)

    app.get('/:username', getProfile)
    app.get('/:username/tweets', getTweets)
    app.get('/:username/likes', getLikes)
}
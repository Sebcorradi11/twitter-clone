import { create, remove, getOne, timeline } from '../controllers/tweet.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function tweetRoutes(app) {
    app.addHook('preHandler', authenticate)

    app.post('/', create)
    app.delete('/:id', remove)
    app.get('/:id', getOne)
    app.get('/', timeline)
}
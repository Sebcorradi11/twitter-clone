import { toggle } from '../controllers/like.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function likeRoutes(app) {
    app.addHook('preHandler', authenticate)

    app.post('/:id/like', toggle)
}
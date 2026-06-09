import { toggle, followers, following } from '../controllers/follow.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function followRoutes(app) {
    app.addHook('preHandler', authenticate)

    app.post('/:id/follow', toggle)
    app.get('/:id/followers', followers)
    app.get('/:id/following', following)
}
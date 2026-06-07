import { search } from '../controllers/search.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function searchRoutes(app) {
    app.addHook('preHandler', authenticate)

    app.get('/users', search)
}
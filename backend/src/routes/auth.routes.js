import { register, login, me } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function authRoutes(app) {
  app.post('/register', register)
  app.post('/login', login)
  app.get('/me', { preHandler: [authenticate] }, me)
}
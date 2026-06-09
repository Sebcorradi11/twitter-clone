import { list, unreadCount, readAll } from '../controllers/notification.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function notificationRoutes(app) {
  app.addHook('preHandler', authenticate)

  app.get('/', list)
  app.get('/unread-count', unreadCount)
  app.put('/read-all', readAll)
}
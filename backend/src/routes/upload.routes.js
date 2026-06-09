import { uploadImage } from '../controllers/upload.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

export async function uploadRoutes(app) {
  app.addHook('preHandler', authenticate)
  app.post('/', uploadImage)
}

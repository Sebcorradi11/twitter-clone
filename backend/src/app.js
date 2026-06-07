import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth.routes.js'
import { tweetRoutes } from './routes/tweet.routes.js'
import { likeRoutes } from './routes/like.routes.js'
import { followRoutes } from './routes/follow.routes.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
  })

  await app.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
  })

  await app.register(
    async (api) => {
      api.register(authRoutes, { prefix: '/auth' })
      api.register(tweetRoutes, { prefix: '/tweets' })
      api.register(likeRoutes, { prefix: '/tweets' })
      api.register(followRoutes, { prefix: '/users' })
    },
    { prefix: '/api' }
  )

  app.get('/health', async () => ({ status: 'ok' }))

  return app
}

const app = await buildApp()
await app.listen({ port: process.env.PORT || 3001, host: '0.0.0.0' })
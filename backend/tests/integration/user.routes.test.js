import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('User Routes — Integration Tests', () => {
  let app
  let user
  let token
  let userIds = []

  beforeAll(async () => {
    app = await createTestApp()
    user = await createTestUser()
    userIds.push(user.id)
    token = await app.jwt.sign({ userId: user.id, username: user.username })
  })

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await app.close()
    await prisma.$disconnect()
  })

  describe('GET /api/users/:username', () => {
    it('debe retornar el perfil de un usuario', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${user.username}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.user.username).toBe(user.username)
      expect(body.user.name).toBe(user.name)
      expect(body.user).not.toHaveProperty('password')
    })

    it('debe retornar 404 si el usuario no existe', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/usuarioquenoexiste',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(404)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${user.username}`,
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/users/:username/tweets', () => {
    it('debe retornar los tweets de un usuario', async () => {
      await prisma.tweet.create({
        data: { content: 'Tweet de test', authorId: user.id },
      })

      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${user.username}/tweets`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.tweets)).toBe(true)
      expect(body.tweets.length).toBeGreaterThan(0)
    })

    it('debe retornar 404 si el usuario no existe', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/users/usuarioquenoexiste/tweets',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(404)
    })

    it('debe soportar paginación con cursor', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${user.username}/tweets?limit=1`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body).toHaveProperty('hasMore')
      expect(body).toHaveProperty('nextCursor')
    })
  })
})
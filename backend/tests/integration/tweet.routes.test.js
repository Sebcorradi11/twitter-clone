import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Tweet Routes — Integration Tests', () => {
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

  describe('POST /api/tweets', () => {
    it('debe crear un tweet correctamente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tweets',
        headers: { authorization: `Bearer ${token}` },
        body: { content: 'Tweet de integración' },
      })

      expect(res.statusCode).toBe(201)
      const body = JSON.parse(res.body)
      expect(body.tweet.content).toBe('Tweet de integración')
      expect(body.tweet.author.id).toBe(user.id)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tweets',
        body: { content: 'Tweet sin auth' },
      })

      expect(res.statusCode).toBe(401)
    })

    it('debe fallar con contenido vacío', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tweets',
        headers: { authorization: `Bearer ${token}` },
        body: { content: '' },
      })

      expect(res.statusCode).toBe(400)
    })

    it('debe fallar con más de 280 caracteres', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/tweets',
        headers: { authorization: `Bearer ${token}` },
        body: { content: 'a'.repeat(281) },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('GET /api/tweets/:id', () => {
    it('debe retornar un tweet por id', async () => {
      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet para buscar', authorId: user.id },
      })

      const res = await app.inject({
        method: 'GET',
        url: `/api/tweets/${tweet.id}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.tweet.id).toBe(tweet.id)
    })

    it('debe retornar 404 si el tweet no existe', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tweets/idquenovaexistir',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(404)
    })
  })

  describe('DELETE /api/tweets/:id', () => {
    it('debe eliminar un tweet propio', async () => {
      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet a eliminar', authorId: user.id },
      })

      const res = await app.inject({
        method: 'DELETE',
        url: `/api/tweets/${tweet.id}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(204)
    })

    it('no debe eliminar un tweet ajeno', async () => {
      const otherUser = await createTestUser()
      userIds.push(otherUser.id)

      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet ajeno', authorId: otherUser.id },
      })

      const res = await app.inject({
        method: 'DELETE',
        url: `/api/tweets/${tweet.id}`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(403)
    })
  })

  describe('POST /api/tweets/:id/like', () => {
    it('debe likear un tweet', async () => {
      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet para likear', authorId: user.id },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/api/tweets/${tweet.id}/like`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.liked).toBe(true)
      expect(body.likesCount).toBe(1)
    })

    it('debe deslikear un tweet ya likeado', async () => {
      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet para deslikear', authorId: user.id },
      })

      await prisma.like.create({
        data: { userId: user.id, tweetId: tweet.id },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/api/tweets/${tweet.id}/like`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.liked).toBe(false)
      expect(body.likesCount).toBe(0)
    })
  })

  describe('GET /api/tweets (timeline)', () => {
    it('debe retornar el timeline del usuario', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tweets',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.tweets)).toBe(true)
      expect(body).toHaveProperty('hasMore')
      expect(body).toHaveProperty('nextCursor')
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/tweets',
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
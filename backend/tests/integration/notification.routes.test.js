import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Notification Routes — Integration Tests', () => {
  let app
  let user
  let otherUser
  let token
  let otherToken
  let userIds = []

  beforeAll(async () => {
    app = await createTestApp()
    user = await createTestUser()
    otherUser = await createTestUser()
    userIds.push(user.id, otherUser.id)
    token = await app.jwt.sign({ userId: user.id, username: user.username })
    otherToken = await app.jwt.sign({ userId: otherUser.id, username: otherUser.username })
  })

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await app.close()
    await prisma.$disconnect()
  })

  describe('GET /api/notifications', () => {
    it('debe retornar lista de notificaciones vacía', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.notifications)).toBe(true)
      expect(body).toHaveProperty('hasMore')
      expect(body).toHaveProperty('nextCursor')
    })

    it('debe crear notificación al dar like y aparecer en la lista', async () => {
      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet para notificación', authorId: user.id },
      })

      await app.inject({
        method: 'POST',
        url: `/api/tweets/${tweet.id}/like`,
        headers: { authorization: `Bearer ${otherToken}` },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.notifications.length).toBeGreaterThan(0)
      expect(body.notifications[0].type).toBe('LIKE')
      expect(body.notifications[0].actor.id).toBe(otherUser.id)
    })

    it('debe crear notificación al recibir un follow', async () => {
      await app.inject({
        method: 'POST',
        url: `/api/users/${user.id}/follow`,
        headers: { authorization: `Bearer ${otherToken}` },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      const followNotif = body.notifications.find(n => n.type === 'FOLLOW')
      expect(followNotif).toBeDefined()
      expect(followNotif.actor.id).toBe(otherUser.id)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications',
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/notifications/unread-count', () => {
    it('debe retornar el conteo de notificaciones no leídas', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications/unread-count',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(typeof body.count).toBe('number')
      expect(body.count).toBeGreaterThan(0)
    })
  })

  describe('PUT /api/notifications/read-all', () => {
    it('debe marcar todas las notificaciones como leídas', async () => {
      await app.inject({
        method: 'PUT',
        url: '/api/notifications/read-all',
        headers: { authorization: `Bearer ${token}` },
      })

      const res = await app.inject({
        method: 'GET',
        url: '/api/notifications/unread-count',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.count).toBe(0)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'PUT',
        url: '/api/notifications/read-all',
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
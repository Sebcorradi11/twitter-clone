import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Follow Routes — Integration Tests', () => {
  let app
  let user
  let otherUser
  let token
  let userIds = []

  beforeAll(async () => {
    app = await createTestApp()
    user = await createTestUser()
    otherUser = await createTestUser()
    userIds.push(user.id, otherUser.id)
    token = await app.jwt.sign({ userId: user.id, username: user.username })
  })

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await app.close()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: user?.id, followingId: otherUser?.id },
          { followerId: otherUser?.id, followingId: user?.id },
        ],
      },
    }).catch(() => {})
  })

  describe('POST /api/users/:id/follow', () => {
    it('debe seguir a un usuario', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/users/${otherUser.id}/follow`,
        headers: { authorization: `Bearer ${token}` },
      })

      console.log('Response body:', res.body)

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.following).toBe(true)
      expect(body.followersCount).toBe(1)
    })

    it('debe dejar de seguir a un usuario ya seguido', async () => {
      await prisma.follow.create({
        data: { followerId: user.id, followingId: otherUser.id },
      })

      const res = await app.inject({
        method: 'POST',
        url: `/api/users/${otherUser.id}/follow`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.following).toBe(false)
    })

    it('no debe permitir seguirse a uno mismo', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/users/${user.id}/follow`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(400)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'POST',
        url: `/api/users/${otherUser.id}/follow`,
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/users/:id/followers', () => {
    it('debe retornar la lista de seguidores', async () => {
      await prisma.follow.create({
        data: { followerId: user.id, followingId: otherUser.id },
      }).catch(() => {})

      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${otherUser.id}/followers`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.followers)).toBe(true)
    })
  })

  describe('GET /api/users/:id/following', () => {
    it('debe retornar la lista de seguidos', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/users/${user.id}/following`,
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.following)).toBe(true)
    })
  })
})
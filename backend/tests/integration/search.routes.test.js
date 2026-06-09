import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Search Routes — Integration Tests', () => {
  let app
  let user
  let token
  let userIds = []

  beforeAll(async () => {
    app = await createTestApp()
    user = await createTestUser({ name: 'Searchable User', username: 'searchableuser' })
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

  describe('GET /api/search/users', () => {
    it('debe encontrar usuarios por username', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/users?q=searchable',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.users)).toBe(true)
      expect(body.users.length).toBeGreaterThan(0)
      expect(body.users[0].username).toContain('searchable')
    })

    it('debe encontrar usuarios por nombre', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/users?q=Searchable',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(Array.isArray(body.users)).toBe(true)
      expect(body.users.length).toBeGreaterThan(0)
    })

    it('debe retornar array vacío si no hay resultados', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/users?q=xyznoexiste999',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.users).toHaveLength(0)
    })

    it('debe fallar sin parámetro q', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/users',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(400)
    })

    it('debe fallar sin autenticación', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/search/users?q=test',
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
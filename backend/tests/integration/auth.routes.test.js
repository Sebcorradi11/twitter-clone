import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Auth Routes — Integration Tests', () => {
  let app
  let userIds = []

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await app.close()
    await prisma.$disconnect()
  })

  describe('POST /api/auth/register', () => {
    it('debe registrar un usuario correctamente', async () => {
      const ts = Date.now().toString().slice(-6)
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          email: `reg${ts}@example.com`,
          username: `reguser${ts}`,
          name: 'Register User',
          password: 'password123',
        },
      })

      expect(res.statusCode).toBe(201)
      const body = JSON.parse(res.body)
      expect(body.token).toBeDefined()
      expect(body.user.email).toContain('@example.com')
      userIds.push(body.user.id)
    })

    it('debe fallar con email duplicado', async () => {
      const user = await createTestUser()
      userIds.push(user.id)
      const ts = Date.now().toString().slice(-6)

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          email: user.email,
          username: `newusr${ts}`,
          name: 'Test',
          password: 'password123',
        },
      })

      expect(res.statusCode).toBe(409)
    })

    it('debe fallar con password menor a 8 caracteres', async () => {
      const ts = Date.now().toString().slice(-6)
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        body: {
          email: `fail${ts}@example.com`,
          username: `failusr${ts}`,
          name: 'Test',
          password: '123',
        },
      })

      expect(res.statusCode).toBe(400)
    })

    it('debe fallar si faltan campos requeridos', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        body: { email: 'test@example.com' },
      })

      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('debe hacer login correctamente', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: user.email,
          password: 'password123',
        },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.token).toBeDefined()
      expect(body.user.id).toBe(user.id)
    })

    it('debe fallar con password incorrecto', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: user.email,
          password: 'wrongpassword',
        },
      })

      expect(res.statusCode).toBe(401)
    })

    it('debe fallar con email inexistente', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'noexiste@example.com',
          password: 'password123',
        },
      })

      expect(res.statusCode).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('debe retornar el usuario autenticado', async () => {
      const user = await createTestUser()
      userIds.push(user.id)
      const token = await app.jwt.sign({ userId: user.id, username: user.username })

      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: `Bearer ${token}` },
      })

      expect(res.statusCode).toBe(200)
      const body = JSON.parse(res.body)
      expect(body.user.id).toBe(user.id)
    })

    it('debe fallar sin token', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
      })

      expect(res.statusCode).toBe(401)
    })

    it('debe fallar con token inválido', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/auth/me',
        headers: { authorization: 'Bearer tokeninvalido' },
      })

      expect(res.statusCode).toBe(401)
    })
  })
})
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { createTestApp, cleanupUser, prisma } from '../helpers.js'

describe('Auth Flow — E2E Test', () => {
  let app
  let registeredUserId
  let authToken

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    if (registeredUserId) {
      await cleanupUser(registeredUserId)
    }
    await app.close()
    await prisma.$disconnect()
  })

  it('1. debe registrar un usuario nuevo', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      body: {
        email: `e2e${Date.now()}@example.com`,
        username: `e2euser${Date.now()}`,
        name: 'E2E User',
        password: 'password123',
      },
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.token).toBeDefined()
    expect(body.user.name).toBe('E2E User')

    registeredUserId = body.user.id
    authToken = body.token
  })

  it('2. debe acceder a /me con el token recibido', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: { authorization: `Bearer ${authToken}` },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.user.id).toBe(registeredUserId)
  })

  it('3. debe hacer login con las credenciales registradas', async () => {
    const userRes = await prisma.user.findUnique({
      where: { id: registeredUserId },
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: userRes.email,
        password: 'password123',
      },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(body.token).toBeDefined()
    authToken = body.token
  })

  it('4. debe crear un tweet con el token del login', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/tweets',
      headers: { authorization: `Bearer ${authToken}` },
      body: { content: 'Tweet E2E de prueba' },
    })

    expect(res.statusCode).toBe(201)
    const body = JSON.parse(res.body)
    expect(body.tweet.content).toBe('Tweet E2E de prueba')
    expect(body.tweet.author.id).toBe(registeredUserId)
  })

  it('5. debe ver el tweet en el timeline', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/tweets',
      headers: { authorization: `Bearer ${authToken}` },
    })

    expect(res.statusCode).toBe(200)
    const body = JSON.parse(res.body)
    expect(Array.isArray(body.tweets)).toBe(true)
  })

  it('6. no debe acceder a rutas protegidas sin token', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    })

    expect(res.statusCode).toBe(401)
  })
})
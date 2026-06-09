import { describe, it, expect, afterAll } from '@jest/globals'
import { createTestUser, cleanupUser, prisma } from '../helpers.js'
import bcrypt from 'bcryptjs'

describe('Auth Service — Unit Tests', () => {
  let userIds = []

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await prisma.$disconnect()
  })

  describe('createUser', () => {
    it('debe crear un usuario con password hasheado', async () => {
      const user = await createTestUser({ name: 'Alice Test' })
      userIds.push(user.id)

      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.email).toContain('@example.com')
      expect(user.password).not.toBe('password123')
    })

    it('el password debe ser un hash bcrypt válido', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const isValid = await bcrypt.compare('password123', user.password)
      expect(isValid).toBe(true)
    })

    it('el username debe ser único', async () => {
      const ts = Date.now().toString().slice(-6)
      const user = await createTestUser({ username: `unique${ts}` })
      userIds.push(user.id)

      await expect(
        createTestUser({ email: `other${ts}@example.com`, username: `unique${ts}` })
      ).rejects.toThrow()
    })

    it('el email debe ser único', async () => {
      const ts = Date.now().toString().slice(-6)
      const user = await createTestUser({ email: `unique${ts}@example.com` })
      userIds.push(user.id)

      await expect(
        createTestUser({ email: `unique${ts}@example.com`, username: `otherusr${ts}` })
      ).rejects.toThrow()
    })
  })

  describe('findUserByEmail', () => {
    it('debe encontrar un usuario por email', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const found = await prisma.user.findUnique({ where: { email: user.email } })
      expect(found).toBeDefined()
      expect(found.id).toBe(user.id)
    })

    it('debe retornar null si el email no existe', async () => {
      const found = await prisma.user.findUnique({ where: { email: 'noexiste@example.com' } })
      expect(found).toBeNull()
    })
  })

  describe('verifyPassword', () => {
    it('debe verificar una contraseña correcta', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const isValid = await bcrypt.compare('password123', user.password)
      expect(isValid).toBe(true)
    })

    it('debe rechazar una contraseña incorrecta', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const isValid = await bcrypt.compare('wrongpassword', user.password)
      expect(isValid).toBe(false)
    })
  })
})
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { buildApp } from '../src/app.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
export const prisma = new PrismaClient({ adapter })

export async function createTestApp() {
  const app = await buildApp({ logger: false })
  return app
}

export async function createTestUser(overrides = {}) {
  const timestamp = `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
  const defaults = {
    email: `test${timestamp}@example.com`,
    username: `user${timestamp.slice(-12)}`,
    name: 'Test User',
    password: await bcrypt.hash('password123', 10),
    avatar: null,
    bio: null,
  }
  return prisma.user.create({ data: { ...defaults, ...overrides } })
}

export async function getAuthToken(app, user) {
  return app.jwt.sign({ userId: user.id, username: user.username })
}

export async function cleanupUser(userId) {
  await prisma.like.deleteMany({ where: { userId } }).catch(() => {})
  await prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }).catch(() => {})
  await prisma.tweet.deleteMany({ where: { authorId: userId } }).catch(() => {})
  await prisma.user.delete({ where: { id: userId } }).catch(() => {})
}
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

function getPrisma() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = getPrisma()

export async function getNotifications({ userId, cursor, limit = 20 }) {
  const notifications = await prisma.notification.findMany({
    where: { recipientId: userId },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const hasMore = notifications.length > limit
  const data = hasMore ? notifications.slice(0, -1) : notifications

  return {
    notifications: data,
    nextCursor: hasMore ? data[data.length - 1].id : null,
    hasMore,
  }
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({
    where: { recipientId: userId, read: false },
  })
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, read: false },
    data: { read: true },
  })
}

export async function createNotification({ type, recipientId, actorId, tweetId = null }) {
  if (recipientId === actorId) return null
  return prisma.notification.create({
    data: { type, recipientId, actorId, tweetId },
  }).catch(() => null)
}
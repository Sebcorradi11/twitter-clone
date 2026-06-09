import { getNotifications, getUnreadCount, markAllAsRead } from '../services/notification.service.js'

export async function list(request, reply) {
  const { cursor, limit } = request.query

  const result = await getNotifications({
    userId: request.user.userId,
    cursor: cursor || null,
    limit: limit ? parseInt(limit) : 20,
  })

  return reply.send(result)
}

export async function unreadCount(request, reply) {
  const count = await getUnreadCount(request.user.userId)
  return reply.send({ count })
}

export async function readAll(request, reply) {
  await markAllAsRead(request.user.userId)
  return reply.send({ success: true })
}
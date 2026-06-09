import { toggleFollow, getFollowers, getFollowing } from '../services/follow.service.js'
import { createNotification } from '../services/notification.service.js'

export async function toggle(request, reply) {
  const { id } = request.params

  try {
    const result = await toggleFollow({
      followerId: request.user.userId,
      followingId: id,
    })

    // Crear notificación si es un follow (no unfollow)
    if (result.following) {
      await createNotification({
        type: 'FOLLOW',
        recipientId: id,
        actorId: request.user.userId,
      })
    }

    return reply.send(result)
  } catch (error) {
    return reply.code(400).send({ error: error.message })
  }
}

export async function followers(request, reply) {
  const { id } = request.params
  const result = await getFollowers(id)
  return reply.send({ followers: result.map(f => f.follower) })
}

export async function following(request, reply) {
  const { id } = request.params
  const result = await getFollowing(id)
  return reply.send({ following: result.map(f => f.following) })
}
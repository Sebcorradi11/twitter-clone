import { toggleLike } from '../services/like.service.js'
import { createNotification } from '../services/notification.service.js'
import { findTweetById } from '../services/tweet.service.js'

export async function toggle(request, reply) {
  const { id } = request.params

  const result = await toggleLike({
    userId: request.user.userId,
    tweetId: id,
  })

  // Crear notificación si es un like (no unlike)
  if (result.liked) {
    const tweet = await findTweetById(id)
    if (tweet) {
      await createNotification({
        type: 'LIKE',
        recipientId: tweet.authorId,
        actorId: request.user.userId,
        tweetId: id,
      })
    }
  }

  return reply.send(result)
}
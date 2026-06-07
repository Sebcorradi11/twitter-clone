import { toggleLike } from '../services/like.service.js'

export async function toggle(request, reply) {
    const { id } = request.params

    const result = await toggleLike({
        userId: request.user.userId,
        tweetId: id,
    })

    return reply.send(result)
}
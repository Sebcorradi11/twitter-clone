import { findUserByUsername, getUserTweets } from '../services/user.service.js'

export async function getProfile(request, reply) {
    const { username } = request.params

    const user = await findUserByUsername(username)

    if (!user) {
        return reply.code(404).send({ error: 'Usuario no encontrado' })
    }

    return reply.send({
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            bio: user.bio,
            avatar: user.avatar,
            followersCount: user._count.followers,
            followingCount: user._count.following,
            tweetsCount: user._count.tweets,
        },
    })
}

export async function getTweets(request, reply) {
    const { username } = request.params
    const { cursor, limit } = request.query

    const user = await findUserByUsername(username)

    if (!user) {
        return reply.code(404).send({ error: 'Usuario no encontrado' })
    }

    const result = await getUserTweets({
        userId: user.id,
        cursor: cursor || null,
        limit: limit ? parseInt(limit) : 20,
    })

    return reply.send(result)
}
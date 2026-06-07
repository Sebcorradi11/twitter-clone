import { createTweet, deleteTweet, findTweetById, getTimeline } from '../services/tweet.service.js'

export async function create(request, reply) {
    const { content, parentId, imageUrl } = request.body

    if (!content || content.trim().length === 0) {
        return reply.code(400).send({ error: 'El contenido es requerido' })
    }

    if (content.length > 280) {
        return reply.code(400).send({ error: 'El tweet no puede superar los 280 caracteres' })
    }

    const tweet = await createTweet({
        content,
        authorId: request.user.userId,
        parentId: parentId || null,
        imageUrl: imageUrl || null,
    })

    return reply.code(201).send({ tweet })
}

export async function remove(request, reply) {
    const { id } = request.params

    const tweet = await findTweetById(id)

    if (!tweet) {
        return reply.code(404).send({ error: 'Tweet no encontrado' })
    }

    if (tweet.authorId !== request.user.userId) {
        return reply.code(403).send({ error: 'No podés eliminar un tweet que no es tuyo' })
    }

    await deleteTweet(id)

    return reply.code(204).send()
}

export async function getOne(request, reply) {
    const { id } = request.params

    const tweet = await findTweetById(id)

    if (!tweet) {
        return reply.code(404).send({ error: 'Tweet no encontrado' })
    }

    return reply.send({ tweet })
}

export async function timeline(request, reply) {
    const { cursor, limit } = request.query

    const result = await getTimeline({
        userId: request.user.userId,
        cursor: cursor || null,
        limit: limit ? parseInt(limit) : 20,
    })

    return reply.send(result)
}
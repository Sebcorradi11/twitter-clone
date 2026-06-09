import { searchUsers } from '../services/search.service.js'

export async function search(request, reply) {
    const { q } = request.query

    if (!q || q.trim().length === 0) {
        return reply.code(400).send({ error: 'El parámetro q es requerido' })
    }

    const users = await searchUsers(q.trim())

    return reply.send({ users })
}
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

export async function searchUsers(query) {
    return prisma.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { name: { contains: query, mode: 'insensitive' } },
            ],
        },
        take: 10,
        select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            avatar: true,
            _count: {
                select: {
                    followers: true,
                    following: true,
                },
            },
        },
    })
}
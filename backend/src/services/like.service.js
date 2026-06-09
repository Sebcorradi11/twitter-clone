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

export async function toggleLike({ userId, tweetId }) {
    const existing = await prisma.like.findUnique({
        where: { userId_tweetId: { userId, tweetId } },
    })

    if (existing) {
        await prisma.like.delete({
            where: { userId_tweetId: { userId, tweetId } },
        })
        const count = await prisma.like.count({ where: { tweetId } })
        return { liked: false, likesCount: count }
    } else {
        await prisma.like.create({
            data: { userId, tweetId },
        })
        const count = await prisma.like.count({ where: { tweetId } })
        return { liked: true, likesCount: count }
    }
}
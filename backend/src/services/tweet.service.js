import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const authorSelect = {
    select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        avatar: true,
    },
}

export async function createTweet({ content, authorId, parentId = null, imageUrl = null }) {
    return prisma.tweet.create({
        data: {
            content,
            authorId,
            parentId,
            imageUrl,
        },
        include: {
            author: authorSelect,
            _count: { select: { likes: true, replies: true } },
        },
    })
}

export async function deleteTweet(id) {
    return prisma.tweet.delete({ where: { id } })
}

export async function findTweetById(id) {
    return prisma.tweet.findUnique({
        where: { id },
        include: {
            author: authorSelect,
            _count: { select: { likes: true, replies: true } },
            replies: {
                include: {
                    author: authorSelect,
                    _count: { select: { likes: true, replies: true } },
                },
                orderBy: { createdAt: 'asc' },
            },
        },
    })
}

export async function getTimeline({ userId, cursor, limit = 20 }) {
    const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
    })

    const followingIds = follows.map(f => f.followingId)
    const authorIds = [...followingIds, userId]

    const tweets = await prisma.tweet.findMany({
        where: {
            authorId: { in: authorIds },
            parentId: null,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            author: authorSelect,
            likes: {
                where: { userId },
                select: { userId: true },
            },
            _count: { select: { likes: true, replies: true } },
        },
        orderBy: { createdAt: 'desc' },
    })

    const hasMore = tweets.length > limit
    const data = hasMore ? tweets.slice(0, -1) : tweets

    return {
        tweets: data,
        nextCursor: hasMore ? data[data.length - 1].id : null,
        hasMore,
    }
}
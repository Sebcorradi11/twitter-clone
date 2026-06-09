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

export async function findUserByUsername(username) {
    return prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        include: {
            _count: {
                select: {
                    followers: true,
                    following: true,
                    tweets: true,
                },
            },
        },
    })
}

export async function checkIsFollowing(followerId, followingId) {
    const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId, followingId } },
    })
    return !!follow
}

export async function getUserTweets({ userId, cursor, limit = 20 }) {
    const tweets = await prisma.tweet.findMany({
        where: {
            authorId: userId,
            parentId: null,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    name: true,
                    bio: true,
                    avatar: true,
                },
            },
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

export async function getUserLikes({ username, currentUserId }) {
    const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
    })
    if (!user) return null

    const likes = await prisma.like.findMany({
        where: { userId: user.id },
        include: {
            tweet: {
                include: {
                    author: {
                        select: { id: true, username: true, name: true, bio: true, avatar: true },
                    },
                    likes: { where: { userId: currentUserId || user.id }, select: { userId: true } },
                    _count: { select: { likes: true, replies: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    return likes.map(l => l.tweet)
}

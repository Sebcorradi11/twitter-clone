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

export async function toggleFollow({ followerId, followingId }) {
  if (followerId === followingId) {
    throw new Error('No podés seguirte a vos mismo')
  }
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  })
  if (existing) {
    await prisma.follow.delete({
      where: { followerId_followingId: { followerId, followingId } },
    })
    const count = await prisma.follow.count({ where: { followingId } })
    return { following: false, followersCount: count }
  } else {
    await prisma.follow.create({
      data: { followerId, followingId },
    })
    const count = await prisma.follow.count({ where: { followingId } })
    return { following: true, followersCount: count }
  }
}

export async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    include: { follower: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: { following: true },
    orderBy: { createdAt: 'desc' },
  })
}
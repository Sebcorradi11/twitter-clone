import { describe, it, expect, afterAll } from '@jest/globals'
import { createTestUser, cleanupUser, prisma } from '../helpers.js'

describe('Tweet Service — Unit Tests', () => {
  let userIds = []

  afterAll(async () => {
    for (const id of userIds) {
      await cleanupUser(id)
    }
    await prisma.$disconnect()
  })

  describe('createTweet', () => {
    it('debe crear un tweet correctamente', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet de prueba', authorId: user.id },
      })

      expect(tweet).toBeDefined()
      expect(tweet.id).toBeDefined()
      expect(tweet.content).toBe('Tweet de prueba')
      expect(tweet.authorId).toBe(user.id)
      expect(tweet.parentId).toBeNull()
    })

    it('debe respetar el límite de 280 caracteres', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const longContent = 'a'.repeat(281)

      await expect(
        prisma.tweet.create({
          data: { content: longContent, authorId: user.id },
        })
      ).rejects.toThrow()
    })

    it('debe crear un reply con parentId', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const parent = await prisma.tweet.create({
        data: { content: 'Tweet padre', authorId: user.id },
      })

      const reply = await prisma.tweet.create({
        data: { content: 'Reply de prueba', authorId: user.id, parentId: parent.id },
      })

      expect(reply.parentId).toBe(parent.id)
    })
  })

  describe('deleteTweet', () => {
    it('debe eliminar un tweet correctamente', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet a eliminar', authorId: user.id },
      })

      await prisma.tweet.delete({ where: { id: tweet.id } })

      const found = await prisma.tweet.findUnique({ where: { id: tweet.id } })
      expect(found).toBeNull()
    })
  })

  describe('likeTweet', () => {
    it('debe crear un like correctamente', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet para likear', authorId: user.id },
      })

      const like = await prisma.like.create({
        data: { userId: user.id, tweetId: tweet.id },
      })

      expect(like).toBeDefined()
      expect(like.userId).toBe(user.id)
      expect(like.tweetId).toBe(tweet.id)
    })

    it('no debe permitir likear el mismo tweet dos veces', async () => {
      const user = await createTestUser()
      userIds.push(user.id)

      const tweet = await prisma.tweet.create({
        data: { content: 'Tweet doble like', authorId: user.id },
      })

      await prisma.like.create({
        data: { userId: user.id, tweetId: tweet.id },
      })

      await expect(
        prisma.like.create({
          data: { userId: user.id, tweetId: tweet.id },
        })
      ).rejects.toThrow()
    })
  })

  describe('followUser', () => {
    it('debe crear un follow correctamente', async () => {
      const follower = await createTestUser()
      const following = await createTestUser()
      userIds.push(follower.id, following.id)

      const follow = await prisma.follow.create({
        data: { followerId: follower.id, followingId: following.id },
      })

      expect(follow).toBeDefined()
      expect(follow.followerId).toBe(follower.id)
      expect(follow.followingId).toBe(following.id)
    })

    it('no debe permitir follows duplicados', async () => {
      const follower = await createTestUser()
      const following = await createTestUser()
      userIds.push(follower.id, following.id)

      await prisma.follow.create({
        data: { followerId: follower.id, followingId: following.id },
      })

      await expect(
        prisma.follow.create({
          data: { followerId: follower.id, followingId: following.id },
        })
      ).rejects.toThrow()
    })
  })
})
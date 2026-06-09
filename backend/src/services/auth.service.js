import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'
import bcrypt from 'bcryptjs'

function getPrisma() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = getPrisma()

export async function createUser({ email, username, name, password }) {
  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      username: username.toLowerCase(),
      name,
      password: hashedPassword,
    },
  })

  return user
}

export async function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
  })
}

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
  })
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword)
}
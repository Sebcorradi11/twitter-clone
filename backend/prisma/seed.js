import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const USERS = [
  { email: 'alice@example.com', username: 'alice', name: 'Alice Chen', bio: 'Full-stack dev 🚀 | Open source lover' },
  { email: 'bob@example.com', username: 'bob', name: 'Bob Martinez', bio: 'Backend engineer. Rust & Go enthusiast 🦀' },
  { email: 'carol@example.com', username: 'carol', name: 'Carol Johnson', bio: 'Designer turned developer 🎨' },
  { email: 'dave@example.com', username: 'dave', name: 'Dave Wilson', bio: 'DevOps engineer. K8s y Docker todo el día ☁️' },
  { email: 'eve@example.com', username: 'eve', name: 'Eve Thompson', bio: 'ML engineer | Python 🐍' },
  { email: 'frank@example.com', username: 'frank', name: 'Frank Garcia', bio: 'Tech lead | Mentor | Speaker 🎤' },
  { email: 'grace@example.com', username: 'grace', name: 'Grace Lee', bio: 'Frontend obsessed. React y TypeScript ✨' },
  { email: 'henry@example.com', username: 'henry', name: 'Henry Brown', bio: 'Security researcher 🔐' },
  { email: 'iris@example.com', username: 'iris', name: 'Iris Davis', bio: 'Product engineer 📱' },
  { email: 'jack@example.com', username: 'jack', name: 'Jack Miller', bio: 'Startup founder 😅' },
]

const TWEETS = [
  'Desplegué a producción un viernes. Viviendo peligrosamente 🚀',
  'El mejor código es el que borrás',
  'Por qué le decimos "deuda técnica" y no "hipoteca de código"? 🏦',
  'Café ☕ + teclado ⌨️ + auriculares 🎧 = modo flow activado',
  'Recordatorio: hecho es mejor que perfecto. Shipealo.',
  'Llegué al 80% de cobertura de tests en una codebase legacy. Hoy fue un buen día 🎉',
  'Leer código ajeno a las 2am es otra experiencia',
  'La mejor documentación es la que no necesitás escribir porque el código es claro',
  'PostgreSQL > MySQL. No acepto preguntas.',
  'git blame es una herramienta de autoreflexión',
  'Si no estás rompiendo cosas, no estás moviéndote lo suficientemente rápido',
  'PSA: Por favor escribí mensajes de commit significativos. Tu yo del futuro te lo va a agradecer.',
  'La habilidad más subestimada en tech: saber cuándo dejar de optimizar',
  'Acabo de arreglar un bug que fue introducido por el fix de otro bug. Recursión en la vida real.',
  'El open source es amor. El open source es vida. 💙',
  'CSS es un lenguaje de programación. Cambien mi opinión.',
  'El pair programming te hace dar cuenta de lo diferente que piensan los demás. Fascinante y aterrador.',
  'Kubernetes es Docker Compose para gente que se odia a sí misma 😂',
  'Acabo de pushear con --force en main. Todo bien, todo bien... 💀',
  'Las reuniones que podrían haber sido un email, los emails que podrían haber sido un mensaje, los mensajes que nunca deberían haber existido.',
]

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Crear usuarios
  console.log('👤 Creando usuarios...')
  const users = []
  for (const userData of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } })
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        },
      })
      users.push(user)
      console.log(`  ✓ ${user.username}`)
    } else {
      users.push(existing)
      console.log(`  → ${existing.username} ya existe`)
    }
  }

  // Crear tweets
  console.log('🐦 Creando tweets...')
  const tweets = []
  for (let i = 0; i < TWEETS.length; i++) {
    const author = users[i % users.length]
    const tweet = await prisma.tweet.create({
      data: {
        content: TWEETS[i],
        authorId: author.id,
        createdAt: new Date(Date.now() - (TWEETS.length - i) * 1000 * 60 * 30),
      },
    })
    tweets.push(tweet)
  }
  console.log(`  ✓ ${tweets.length} tweets creados`)

  // Crear follows
  console.log('👥 Creando follows...')
  let followCount = 0
  for (let i = 0; i < users.length; i++) {
    const numFollowing = Math.floor(Math.random() * 4) + 3
    const targets = [...users]
      .filter((_, idx) => idx !== i)
      .sort(() => Math.random() - 0.5)
      .slice(0, numFollowing)

    for (const target of targets) {
      await prisma.follow.create({
        data: { followerId: users[i].id, followingId: target.id },
      }).catch(() => {})
      followCount++
    }
  }
  console.log(`  ✓ ${followCount} follows creados`)

  // Crear likes
  console.log('❤️ Creando likes...')
  let likeCount = 0
  for (const tweet of tweets) {
    const likers = [...users]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 5) + 1)

    for (const liker of likers) {
      await prisma.like.create({
        data: { userId: liker.id, tweetId: tweet.id },
      }).catch(() => {})
      likeCount++
    }
  }
  console.log(`  ✓ ${likeCount} likes creados`)

  console.log('\n✅ Seed completo!')
  console.log('\n📋 Credenciales de prueba:')
  console.log('  Email:    alice@example.com')
  console.log('  Password: password123')
  console.log('\n  Cualquier usuario del seed: password123')
}

main()
  .catch(e => {
    console.error('❌ Seed falló:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
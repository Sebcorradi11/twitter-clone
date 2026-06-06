import { createUser, findUserByEmail, findUserById, verifyPassword } from '../services/auth.service.js'

export async function register(request, reply) {
  const { email, username, name, password } = request.body

  // Validaciones básicas
  if (!email || !username || !name || !password) {
    return reply.code(400).send({ error: 'Todos los campos son requeridos' })
  }

  if (password.length < 8) {
    return reply.code(400).send({ error: 'La contraseña debe tener al menos 8 caracteres' })
  }

  if (username.length < 3 || username.length > 20) {
    return reply.code(400).send({ error: 'El username debe tener entre 3 y 20 caracteres' })
  }

  // Verificar si el email o username ya existe
  const existing = await findUserByEmail(email)
  if (existing) {
    return reply.code(409).send({ error: 'El email ya está registrado' })
  }

  const user = await createUser({ email, username, name, password })

  const token = request.server.jwt.sign({ userId: user.id })

  return reply.code(201).send({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  })
}

export async function login(request, reply) {
  const { email, password } = request.body

  if (!email || !password) {
    return reply.code(400).send({ error: 'Email y password son requeridos' })
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return reply.code(401).send({ error: 'Credenciales inválidas' })
  }

  const validPassword = await verifyPassword(password, user.password)
  if (!validPassword) {
    return reply.code(401).send({ error: 'Credenciales inválidas' })
  }

  const token = request.server.jwt.sign({ userId: user.id })

  return reply.send({
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    },
  })
}

export async function me(request, reply) {
  const user = await findUserById(request.user.userId)

  if (!user) {
    return reply.code(404).send({ error: 'Usuario no encontrado' })
  }

  return reply.send({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
    },
  })
}
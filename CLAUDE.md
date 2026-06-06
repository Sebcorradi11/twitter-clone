# Twitter Clone — CLAUDE.md

## Contexto del proyecto
Clon funcional de Twitter/X desarrollado como challenge técnico.
Monorepo con backend y frontend separados.

## Stack
- **Backend:** Node.js + Fastify + PostgreSQL + Prisma ORM
- **Frontend:** React (Vite) + JavaScript
- **Auth:** JWT propio (sin Firebase ni Supabase)
- **DB:** PostgreSQL (SQLite para tests)

## Arquitectura backend
MVC clásico:
- `routes/` — definición de endpoints
- `controllers/` — lógica de cada endpoint
- `services/` — lógica de negocio reutilizable
- `models/` — acceso a datos vía Prisma

## Modelo de datos
- Replies como self-relation en Tweet (campo parentId)
- Follows con tabla explícita Follow { followerId, followingId }

## Convenciones
- Commits en inglés, formato: `tipo: descripción` (feat, fix, chore, test, docs)
- Variables y funciones en camelCase
- Archivos en kebab-case
- Respuestas de API siempre en JSON
- Manejo de errores centralizado

## Comandos útiles
- `cd backend && npm run dev` — levanta el backend
- `cd frontend && npm run dev` — levanta el frontend
- `cd backend && npx prisma studio` — UI de la base de datos
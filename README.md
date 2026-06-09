# Challenge AI TwitterClone

Clon funcional de Twitter/X desarrollado como challenge técnico full-stack.

## Stack

- **Backend:** Node.js + Fastify + PostgreSQL + Prisma
- **Frontend:** React + Vite + Tailwind CSS
- **Auth:** JWT propio
- **Testing:** Jest (87.64% cobertura)

## Prerrequisitos

- Node.js v22+
- PostgreSQL v15+
- npm v10+

## Setup

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/twitter-clone.git
cd twitter-clone
```

### 2. Configurar el backend

```bash
cd backend
npm install
```

Copiá el archivo de ejemplo y completá tus credenciales:

```bash
cp .env.example .env
```

Contenido del `.env`:
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/twitter_clone"
DATABASE_URL_TEST="postgresql://postgres:TU_PASSWORD@localhost:5432/twitter_clone_test"
JWT_SECRET="un-secret-seguro-de-al-menos-32-caracteres"
PORT=3001
FRONTEND_URL="http://localhost:5173"

### 3. Crear las bases de datos

Desde pgAdmin o psql:

```sql
CREATE DATABASE twitter_clone;
CREATE DATABASE twitter_clone_test;
```

### 4. Correr migraciones

```bash
npx prisma migrate deploy
npx prisma generate
```

### 5. Correr el seed

```bash
npm run db:seed
```

Esto crea 10 usuarios con tweets, follows y likes cruzados.

### 6. Levantar el backend

```bash
npm run dev
```

Servidor disponible en `http://localhost:3001`

### 7. Configurar el frontend

```bash
cd ../frontend
npm install
npm run dev
```

Frontend disponible en `http://localhost:5173`

## Credenciales de prueba

Después de correr el seed podés ingresar con cualquiera de estos usuarios:

| Email | Password |
|-------|----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| demo@example.com | password123 |

## Correr los tests

```bash
cd backend
$env:DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/twitter_clone_test"
npm test
```

Cobertura actual: **84%**

## Comandos útiles

```bash
# Backend
npm run dev          # Desarrollo con hot reload
npm run start        # Producción
npm run db:seed      # Poblar base de datos
npm test             # Correr tests con cobertura
npx prisma studio    # UI visual de la base de datos

# Frontend  
npm run dev          # Desarrollo
npm run build        # Build de producción
```

## Arquitectura
twitter-clone/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Lógica de endpoints
│   │   ├── routes/        # Definición de rutas
│   │   ├── services/      # Lógica de negocio
│   │   └── middleware/    # Auth JWT
│   ├── prisma/
│   │   ├── schema.prisma  # Modelo de datos
│   │   └── seed.js        # Datos de prueba
│   └── tests/             # Suite de tests
├── frontend/
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Páginas
│       ├── context/       # Estado global
│       ├── services/      # Llamadas a API
│       └── hooks/         # Custom hooks
└── README.md

## Decisiones técnicas

- **Fastify sobre Express** — mejor performance y soporte nativo de async/await
- **Prisma** — migraciones automáticas y queries type-safe
- **Cursor pagination** — más eficiente que offset para feeds
- **Monorepo** — commits atómicos y un solo Runbook para el evaluador
- **JWT propio** — sin dependencias de terceros como Firebase Auth
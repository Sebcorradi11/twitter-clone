import { config } from 'dotenv'

config()

// Usar la base de datos de test
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
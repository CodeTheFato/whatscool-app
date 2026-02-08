import "dotenv/config"
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL não configurada')
  }

  // Pool otimizado para serverless (Vercel)
  const pool = new Pool({
    connectionString,
    max: 1, // Máximo 1 conexão por instância serverless
    idleTimeoutMillis: 0, // Não fechar conexões ociosas
    connectionTimeoutMillis: 10000, // 10s para conectar
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

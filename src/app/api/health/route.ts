import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Testar conexão com query simples
    await prisma.$queryRaw`SELECT 1`

    // Testar se consegue ler do banco
    const userCount = await prisma.user.count()

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      userCount,
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
    }, { status: 500 })
  }
}

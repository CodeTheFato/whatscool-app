import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      schoolName,
      taxId,
      schoolType,
      studentCount,
      city,
      state,
      mainEmail,
      officePhone,
      whatsapp,
      whatsappType,
      timezone,
      responsibleName,
      role,
      loginEmail,
      password,
    } = body

    // Validações básicas
    if (!schoolName || !city || !state || !mainEmail || !officePhone || !whatsapp || !responsibleName || !loginEmail || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma escola com o mesmo CNPJ
    if (taxId) {
      const existingSchool = await prisma.school.findUnique({
        where: { cnpj: taxId }
      })

      if (existingSchool) {
        return NextResponse.json(
          { error: 'School with this Tax ID already exists' },
          { status: 409 }
        )
      }
    }

    // Nota: Validação de email único será feita após criar a escola
    // pois o email é único apenas dentro do contexto de uma escola

    // TODO: Instalar bcrypt e fazer hash da senha
    // import { hash } from 'bcrypt'
    // const hashedPassword = await hash(password, 10)
    const hashedPassword = password // TEMPORÁRIO: Remover em produção

    // Mapear role do formulário para o enum UserRole
    // director, coordinator, secretary, it, other -> SECRETARY (admin)
    const userRole = 'SECRETARY' // Todos os administradores são SECRETARY

    // Criar escola e usuário administrador em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar escola
      const school = await tx.school.create({
        data: {
          name: schoolName,
          cnpj: taxId || null,
          schoolType: schoolType || null,
          studentCount: studentCount || null,
          address: '', // TODO: Adicionar campo address no formulário
          city,
          state,
          zipCode: '', // TODO: Adicionar campo zipCode no formulário
          email: mainEmail,
          phone: officePhone,
          whatsapp: whatsapp || null,
          whatsappType: whatsappType || null,
          timezone: timezone || 'America/Sao_Paulo',
        }
      })

      // Criar usuário administrador
      const user = await tx.user.create({
        data: {
          schoolId: school.id,
          name: responsibleName,
          email: loginEmail,
          password: hashedPassword,
          role: userRole,
          isActive: true,
        }
      })

      return { school, user }
    })

    return NextResponse.json(
      {
        message: 'School registered successfully',
        school: {
          id: result.school.id,
          name: result.school.name,
          email: result.school.email,
        },
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating school:', error)

    // Log detalhado do erro para debug
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Construir filtro de busca
    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
          { cnpj: { contains: search, mode: 'insensitive' as const } },
        ]
      }
      : {}

    // Buscar escolas com paginação
    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          cnpj: true,
          schoolType: true,
          studentCount: true,
          address: true,
          city: true,
          state: true,
          zipCode: true,
          email: true,
          phone: true,
          whatsapp: true,
          whatsappType: true,
          timezone: true,
          logo: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      prisma.school.count({ where })
    ])

    return NextResponse.json({
      schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('Error fetching schools:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

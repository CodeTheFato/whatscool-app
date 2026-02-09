import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      name,
      cnpj,
      schoolType,
      studentCount,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      whatsapp,
      whatsappType,
      timezone,
      logo,
    } = body

    // Validações básicas
    if (!name || !city || !state || !phone || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar se já existe uma escola com o mesmo CNPJ
    if (cnpj) {
      const existingSchool = await prisma.school.findUnique({
        where: { cnpj }
      })

      if (existingSchool) {
        return NextResponse.json(
          { error: 'School with this CNPJ already exists' },
          { status: 409 }
        )
      }
    }

    // Criar escola
    const school = await prisma.school.create({
      data: {
        name,
        cnpj: cnpj || null,
        schoolType: schoolType || null,
        studentCount: studentCount || null,
        address: address || null,
        city,
        state,
        zipCode: zipCode || null,
        email,
        phone,
        whatsapp: whatsapp || null,
        whatsappType: whatsappType || null,
        timezone: timezone || 'America/Sao_Paulo',
        logo: logo || null,
      }
    })

    return NextResponse.json(
      {
        message: 'School created successfully',
        school: {
          id: school.id,
          name: school.name,
          email: school.email,
          city: school.city,
          state: school.state,
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
          _count: {
            select: {
              students: true,
              teachers: true,
              classes: true,
            },
          },
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

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/schools/[id] - Buscar escola por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true,
            users: true,
          }
        }
      }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(school)
  } catch (error) {
    console.error('Error fetching school:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/schools/[id] - Atualizar escola
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Verificar se a escola existe
    const existingSchool = await prisma.school.findUnique({
      where: { id }
    })

    if (!existingSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Se estiver atualizando o CNPJ, verificar se já não existe outro com o mesmo
    if (body.cnpj && body.cnpj !== existingSchool.cnpj) {
      const schoolWithSameCnpj = await prisma.school.findUnique({
        where: { cnpj: body.cnpj }
      })

      if (schoolWithSameCnpj) {
        return NextResponse.json(
          { error: 'School with this Tax ID already exists' },
          { status: 409 }
        )
      }
    }

    // Mapear campos do body para o schema
    const updateData: any = {}

    if (body.schoolName) updateData.name = body.schoolName
    if (body.taxId !== undefined) updateData.cnpj = body.taxId || null
    if (body.schoolType !== undefined) updateData.schoolType = body.schoolType
    if (body.studentCount !== undefined) updateData.studentCount = body.studentCount
    if (body.city) updateData.city = body.city
    if (body.state) updateData.state = body.state
    if (body.mainEmail) updateData.email = body.mainEmail
    if (body.officePhone) updateData.phone = body.officePhone
    if (body.whatsapp) updateData.whatsapp = body.whatsapp
    if (body.whatsappType) updateData.whatsappType = body.whatsappType
    if (body.timezone) updateData.timezone = body.timezone
    if (body.address !== undefined) updateData.address = body.address
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.logo !== undefined) updateData.logo = body.logo

    // Atualizar escola
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({
      message: 'School updated successfully',
      school: updatedSchool
    })
  } catch (error) {
    console.error('Error updating school:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/schools/[id] - Deletar escola
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar se a escola existe
    const existingSchool = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true,
          }
        }
      }
    })

    if (!existingSchool) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Verificar se há dados relacionados
    const hasRelatedData =
      existingSchool._count.students > 0 ||
      existingSchool._count.teachers > 0 ||
      existingSchool._count.classes > 0

    if (hasRelatedData) {
      return NextResponse.json(
        {
          error: 'Cannot delete school with related data',
          details: {
            students: existingSchool._count.students,
            teachers: existingSchool._count.teachers,
            classes: existingSchool._count.classes,
          }
        },
        { status: 409 }
      )
    }

    // Deletar escola
    await prisma.school.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'School deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting school:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

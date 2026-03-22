import { prisma } from "@/lib/prisma"
import { ApiError } from "@/lib/api"
import { normalizePhoneToInternational } from "@/lib/utils/masks"

interface CreateSchoolData {
  name: string
  cnpj?: string | null
  schoolType?: string | null
  studentCount?: string | null
  address?: string | null
  city: string
  state: string
  zipCode?: string | null
  phone: string
  email: string
  whatsapp?: string | null
  whatsappType?: string | null
  timezone?: string | null
  logo?: string | null
}

interface ListSchoolsParams {
  page: number
  limit: number
  search: string
}

interface UpdateSchoolData {
  schoolName?: string
  taxId?: string | null
  schoolType?: string | null
  studentCount?: string | null
  city?: string
  state?: string
  mainEmail?: string
  officePhone?: string
  whatsapp?: string
  whatsappType?: string
  timezone?: string
  address?: string | null
  zipCode?: string | null
  logo?: string | null
  cnpj?: string
}

export const SchoolService = {
  async create(data: CreateSchoolData) {
    if (!data.name || !data.city || !data.state || !data.phone || !data.email) {
      throw new ApiError(400, "Missing required fields")
    }

    if (data.cnpj) {
      const existing = await prisma.school.findUnique({
        where: { cnpj: data.cnpj },
      })
      if (existing) {
        throw new ApiError(409, "School with this CNPJ already exists")
      }
    }

    const school = await prisma.school.create({
      data: {
        name: data.name,
        cnpj: data.cnpj || null,
        schoolType: data.schoolType || null,
        studentCount: data.studentCount || null,
        address: data.address || null,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode || null,
        email: data.email,
        phone: normalizePhoneToInternational(data.phone),
        whatsapp: data.whatsapp ? normalizePhoneToInternational(data.whatsapp) : null,
        whatsappType: data.whatsappType || null,
        timezone: data.timezone || "America/Sao_Paulo",
        logo: data.logo || null,
      },
    })

    return {
      message: "School created successfully",
      school: {
        id: school.id,
        name: school.name,
        email: school.email,
        city: school.city,
        state: school.state,
      },
    }
  },

  async list({ page, limit, search }: ListSchoolsParams) {
    const skip = (page - 1) * limit

    const where = search
      ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { cnpj: { contains: search, mode: "insensitive" as const } },
        ],
      }
      : {}

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
        },
      }),
      prisma.school.count({ where }),
    ])

    return {
      schools,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  },

  async getById(id: string) {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true,
            users: true,
          },
        },
      },
    })

    if (!school) {
      throw new ApiError(404, "School not found")
    }

    return school
  },

  async update(id: string, body: UpdateSchoolData) {
    const existing = await prisma.school.findUnique({ where: { id } })

    if (!existing) {
      throw new ApiError(404, "School not found")
    }

    if (body.cnpj && body.cnpj !== existing.cnpj) {
      const duplicate = await prisma.school.findUnique({
        where: { cnpj: body.cnpj },
      })
      if (duplicate) {
        throw new ApiError(409, "School with this Tax ID already exists")
      }
    }

    const updateData: Record<string, unknown> = {}
    if (body.schoolName) updateData.name = body.schoolName
    if (body.taxId !== undefined) updateData.cnpj = body.taxId || null
    if (body.schoolType !== undefined) updateData.schoolType = body.schoolType
    if (body.studentCount !== undefined) updateData.studentCount = body.studentCount
    if (body.city) updateData.city = body.city
    if (body.state) updateData.state = body.state
    if (body.mainEmail) updateData.email = body.mainEmail
    if (body.officePhone) updateData.phone = normalizePhoneToInternational(body.officePhone)
    if (body.whatsapp) updateData.whatsapp = normalizePhoneToInternational(body.whatsapp)
    if (body.whatsappType) updateData.whatsappType = body.whatsappType
    if (body.timezone) updateData.timezone = body.timezone
    if (body.address !== undefined) updateData.address = body.address
    if (body.zipCode !== undefined) updateData.zipCode = body.zipCode
    if (body.logo !== undefined) updateData.logo = body.logo

    const updated = await prisma.school.update({
      where: { id },
      data: updateData,
    })

    return { message: "School updated successfully", school: updated }
  },

  async delete(id: string) {
    const existing = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { students: true, teachers: true, classes: true },
        },
      },
    })

    if (!existing) {
      throw new ApiError(404, "School not found")
    }

    const hasRelated =
      existing._count.students > 0 ||
      existing._count.teachers > 0 ||
      existing._count.classes > 0

    if (hasRelated) {
      throw new ApiError(409, "Cannot delete school with related data")
    }

    await prisma.school.delete({ where: { id } })

    return { message: "School deleted successfully" }
  },
}

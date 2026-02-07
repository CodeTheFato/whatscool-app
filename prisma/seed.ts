import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed...")

  // Criar escola de teste
  const school = await prisma.school.upsert({
    where: { id: "seed-school-1" },
    update: {},
    create: {
      id: "seed-school-1",
      name: "Colégio Bosque Azul",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      phone: "(11) 3456-7890",
      email: "contato@bosqueazul.com.br",
      whatsapp: "(11) 98765-4321",
      whatsappType: "Institucional",
      cnpj: "12.345.678/0001-90",
      schoolType: "Particular",
      studentCount: "200-500",
      address: "Rua das Flores, 123",
      timezone: "America/Sao_Paulo",
    },
  })

  console.log(`✅ Escola criada: ${school.name}`)

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: {
      email_schoolId: {
        email: "admin@bosqueazul.com.br",
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@bosqueazul.com.br",
      password: hashedPassword,
      role: "ADMIN",
      schoolId: school.id,
      phone: "(11) 98765-4321",
      isActive: true,
    },
  })

  console.log(`✅ Usuário admin criado: ${admin.email}`)

  // Criar usuário secretaria
  const secretary = await prisma.user.upsert({
    where: {
      email_schoolId: {
        email: "secretaria@bosqueazul.com.br",
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: "Maria Silva",
      email: "secretaria@bosqueazul.com.br",
      password: hashedPassword,
      role: "SECRETARY",
      schoolId: school.id,
      phone: "(11) 98765-1111",
      isActive: true,
    },
  })

  console.log(`✅ Usuário secretária criado: ${secretary.email}`)

  console.log("\n🎉 Seed concluído!")
  console.log("\n📝 Credenciais de acesso:")
  console.log("   Admin:")
  console.log("   Email: admin@bosqueazul.com.br")
  console.log("   Senha: admin123")
  console.log("\n   Secretária:")
  console.log("   Email: secretaria@bosqueazul.com.br")
  console.log("   Senha: admin123")
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando seed...")

  // Criar escola básica
  const school = await prisma.school.upsert({
    where: { id: "seed-school-1" },
    update: {},
    create: {
      id: "seed-school-1",
      name: "Whatschool",
      city: "São Paulo",
      state: "SP",
      phone: "(11) 0000-0000",
      email: "admin@whatschool.com.br",
      timezone: "America/Sao_Paulo",
    },
  })

  console.log(`✅ Escola criada: ${school.name}`)

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10)

  const admin = await prisma.user.upsert({
    where: {
      email_schoolId: {
        email: "admin@whatschool.com.br",
        schoolId: school.id,
      },
    },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@whatschool.com.br",
      password: hashedPassword,
      role: "ADMIN",
      schoolId: school.id,
      isActive: true,
    },
  })

  console.log(`✅ Usuário admin criado: ${admin.email}`)

  console.log("\n🎉 Seed concluído!")
  console.log("\n📝 Credenciais de acesso:")
  console.log("   Email: admin@whatschool.com.br")
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

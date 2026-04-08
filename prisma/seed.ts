import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@disparosteams.com' },
    update: {},
    create: {
      email: 'admin@disparosteams.com',
      password: adminPassword,
      name: 'Administrador',
      role: Role.ADMIN,
      active: true,
    },
  })
  console.log('Admin user created:', admin.email)

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@disparosteams.com' },
    update: {},
    create: {
      email: 'demo@disparosteams.com',
      password: demoPassword,
      name: 'Usuário Demo',
      role: Role.USER,
      active: true,
    },
  })
  console.log('Demo user created:', demo.email)

  console.log('Seed completed!')
  console.log('\n📧 Credenciais de acesso:')
  console.log('Admin: admin@disparosteams.com / admin123')
  console.log('Demo:  demo@disparosteams.com / demo123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin() {
  const email = 'yustintroost@gmail.com'
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    })
    
    console.log(`✅ User ${user.email} is now an admin`)
  } catch (error) {
    console.error('❌ Error making user admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()
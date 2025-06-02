import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetGoogleTokens() {
  try {
    // Delete all Google accounts to force re-authorization
    const result = await prisma.account.deleteMany({
      where: {
        provider: 'google'
      }
    });
    
    console.log(`Deleted ${result.count} Google accounts`);
    console.log('Users will need to sign in again to get new Gmail permissions');
    
  } catch (error) {
    console.error('Error resetting tokens:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetGoogleTokens();
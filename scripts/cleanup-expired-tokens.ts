// Script to clean up expired Google tokens from the database
// Run this script occasionally to remove stale tokens that can't be refreshed

import prisma from '@/lib/database/prisma';

async function cleanupExpiredTokens() {
  console.log('Starting cleanup of expired Google tokens...');

  try {
    // Find accounts with expired tokens (expired more than 7 days ago)
    const oneWeekAgo = Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60);
    
    const expiredAccounts = await prisma.account.findMany({
      where: {
        provider: 'google',
        expires_at: {
          lt: oneWeekAgo
        }
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    });

    console.log(`Found ${expiredAccounts.length} expired Google accounts`);

    if (expiredAccounts.length === 0) {
      console.log('No expired tokens to clean up');
      return;
    }

    // Log the accounts that will be cleaned
    expiredAccounts.forEach(account => {
      console.log(`- User: ${account.user.email}, Expired: ${new Date(account.expires_at! * 1000)}`);
    });

    // Ask for confirmation before deleting
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question('Do you want to delete these expired tokens? (y/N): ', resolve);
    });
    
    rl.close();

    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log('Cleanup cancelled');
      return;
    }

    // Delete expired tokens
    const result = await prisma.account.deleteMany({
      where: {
        provider: 'google',
        expires_at: {
          lt: oneWeekAgo
        }
      }
    });

    console.log(`Successfully deleted ${result.count} expired Google tokens`);
    console.log('Users will need to re-authenticate to restore Google service access');

  } catch (error) {
    console.error('Error during token cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupExpiredTokens();
}

export default cleanupExpiredTokens;
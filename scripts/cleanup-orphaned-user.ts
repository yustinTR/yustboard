import prisma from '../lib/database/prisma';

async function cleanupOrphanedUser() {
  try {
    const email = 'yustin.t2002@gmail.com';
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        accounts: true,
        sessions: true,
        posts: true,
        tasks: true,
        transactions: true
      },
    });

    if (!user) {
      console.log('No user found with email:', email);
      return;
    }

    console.log('\n=== User Found ===');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Accounts: ${user.accounts.length}`);
    console.log(`Sessions: ${user.sessions.length}`);
    console.log(`Posts: ${user.posts.length}`);
    console.log(`Tasks: ${user.tasks.length}`);
    console.log(`Transactions: ${user.transactions.length}`);

    if (user.accounts.length === 0) {
      console.log('\nThis user has no linked OAuth accounts.');
      console.log('This was likely created by the old mock login system.');
      
      // Delete the user (this will cascade delete all related data)
      console.log('\nDeleting orphaned user...');
      await prisma.user.delete({
        where: { id: user.id },
      });
      console.log('✅ User deleted successfully!');
      console.log('\nYou can now sign in with Google using this email address.');
    } else {
      console.log('\nThis user has linked accounts. Not deleting.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupOrphanedUser();
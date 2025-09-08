import prisma from '../lib/database/prisma';

async function checkUsers() {
  try {
    // Find all users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
      },
    });

    console.log('\n=== All Users in Database ===');
    users.forEach((user) => {
      console.log(`\nUser ID: ${user.id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Accounts:`);
      user.accounts.forEach((account) => {
        console.log(`  - Provider: ${account.provider}, ID: ${account.providerAccountId}`);
      });
    });

    // Check for specific email
    const email = 'yustin.t2002@gmail.com';
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    console.log(`\n=== Checking for ${email} ===`);
    if (existingUser) {
      console.log('User found!');
      console.log(`User ID: ${existingUser.id}`);
      console.log(`Linked accounts: ${existingUser.accounts.length}`);
      existingUser.accounts.forEach((account) => {
        console.log(`  - ${account.provider}: ${account.providerAccountId}`);
      });
    } else {
      console.log('No user found with this email.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
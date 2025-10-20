import prisma from '../lib/database/prisma';

async function clearSessions() {
  try {
    // Delete all sessions
    const result = await prisma.session.deleteMany({});
    console.log(`✅ Cleared ${result.count} sessions`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing sessions:', error);
    process.exit(1);
  }
}

clearSessions();

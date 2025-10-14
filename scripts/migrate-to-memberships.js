/**
 * Migration script to convert existing organizationId relationships to OrganizationMembership
 *
 * This script:
 * 1. Creates membership records for all users with an organizationId
 * 2. Creates memberships for both YustBoard Default and Finalist for the main user
 * 3. Keeps the current organizationId for backwards compatibility
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToMemberships() {
  console.log('🚀 Starting migration to OrganizationMembership model...')

  try {
    // Check if we already have memberships
    const existingMemberships = await prisma.organizationMembership.count()
    if (existingMemberships > 0) {
      console.log(`✅ Memberships already exist (${existingMemberships}), skipping migration`)
      return
    }

    // Get all users with an organization
    const users = await prisma.user.findMany({
      where: {
        organizationId: {
          not: null
        }
      },
      select: {
        id: true,
        email: true,
        organizationId: true,
        organizationRole: true
      }
    })

    console.log(`📊 Found ${users.length} users with organization assignments`)

    // Get all organizations
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    console.log(`📊 Found ${organizations.length} organizations`)

    let membershipCount = 0

    // Create membership for each user's current organization
    for (const user of users) {
      if (!user.organizationId) continue

      await prisma.organizationMembership.create({
        data: {
          userId: user.id,
          organizationId: user.organizationId,
          role: user.organizationRole,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })

      membershipCount++
      console.log(`✅ Created membership for ${user.email} in current organization`)
    }

    // Special: Add the main user to ALL organizations (for testing the switcher)
    const mainUser = await prisma.user.findFirst({
      where: {
        email: 'yustintroost@gmail.com'
      }
    })

    if (mainUser) {
      console.log('\n👤 Setting up multi-org access for main user...')

      for (const org of organizations) {
        // Check if membership already exists
        const existingMembership = await prisma.organizationMembership.findUnique({
          where: {
            userId_organizationId: {
              userId: mainUser.id,
              organizationId: org.id
            }
          }
        })

        if (!existingMembership) {
          await prisma.organizationMembership.create({
            data: {
              userId: mainUser.id,
              organizationId: org.id,
              role: 'OWNER',
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })

          membershipCount++
          console.log(`✅ Added ${mainUser.email} to ${org.name} as OWNER`)
        } else {
          console.log(`⏭️  ${mainUser.email} already member of ${org.name}`)
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Created ${membershipCount} memberships`)
    console.log(`   - Total organizations: ${organizations.length}`)
    console.log(`   - Users with memberships: ${users.length}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToMemberships()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateToMemberships }

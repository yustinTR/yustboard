/**
 * Migration script to convert from single-tenant to multi-tenant database structure
 *
 * This script:
 * 1. Creates a default organization for existing data
 * 2. Associates all existing users with the default organization
 * 3. Updates all existing records to use the default organizationId
 *
 * IMPORTANT: Run this after updating the Prisma schema but before deploying
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToMultiTenant() {
  console.log('🚀 Starting migration to multi-tenant structure...')

  try {
    // Check if we already have organizations
    const existingOrgs = await prisma.organization.count()
    if (existingOrgs > 0) {
      console.log('✅ Organizations already exist, skipping migration')
      return
    }

    // Step 1: Create default organization
    console.log('📦 Creating default organization...')
    const defaultOrg = await prisma.organization.create({
      data: {
        name: 'YustBoard Default',
        slug: 'yustboard-default',
        description: 'Default organization for existing users',
        plan: 'FREE',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log(`✅ Created default organization: ${defaultOrg.id}`)

    // Step 2: Create default organization settings
    await prisma.organizationSettings.create({
      data: {
        organizationId: defaultOrg.id,
        allowUserInvites: true,
        brandingEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })
    console.log('✅ Created default organization settings')

    // Step 3: Update all existing users to belong to default organization
    const userCount = await prisma.user.count()
    if (userCount > 0) {
      console.log(`👥 Updating ${userCount} users...`)
      await prisma.user.updateMany({
        data: {
          organizationId: defaultOrg.id,
          organizationRole: 'OWNER' // Make existing users owners of the default org
        }
      })
      console.log('✅ Updated all users with organization')
    }

    // Step 4: Update existing tasks
    const taskCount = await prisma.task.count()
    if (taskCount > 0) {
      console.log(`📝 Updating ${taskCount} tasks...`)
      await prisma.task.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      })
      console.log('✅ Updated all tasks with organization')
    }

    // Step 5: Update existing transactions
    const transactionCount = await prisma.transaction.count()
    if (transactionCount > 0) {
      console.log(`💰 Updating ${transactionCount} transactions...`)
      await prisma.transaction.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      })
      console.log('✅ Updated all transactions with organization')
    }

    // Step 6: Update existing posts
    const postCount = await prisma.post.count()
    if (postCount > 0) {
      console.log(`📰 Updating ${postCount} posts...`)
      await prisma.post.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      })
      console.log('✅ Updated all posts with organization')
    }

    // Step 7: Update existing widget preferences
    const widgetPrefCount = await prisma.userWidgetPreference.count()
    if (widgetPrefCount > 0) {
      console.log(`🔧 Updating ${widgetPrefCount} widget preferences...`)
      await prisma.userWidgetPreference.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      })
      console.log('✅ Updated all widget preferences with organization')
    }

    // Step 8: Update existing blog posts
    const blogPostCount = await prisma.blogPost.count()
    if (blogPostCount > 0) {
      console.log(`📚 Updating ${blogPostCount} blog posts...`)
      await prisma.blogPost.updateMany({
        data: {
          organizationId: defaultOrg.id
        }
      })
      console.log('✅ Updated all blog posts with organization')
    }

    console.log('🎉 Migration completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Created organization: ${defaultOrg.name} (${defaultOrg.slug})`)
    console.log(`   - Updated ${userCount} users`)
    console.log(`   - Updated ${taskCount} tasks`)
    console.log(`   - Updated ${transactionCount} transactions`)
    console.log(`   - Updated ${postCount} posts`)
    console.log(`   - Updated ${widgetPrefCount} widget preferences`)
    console.log(`   - Updated ${blogPostCount} blog posts`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateToMultiTenant()
    .then(() => {
      console.log('✅ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { migrateToMultiTenant }
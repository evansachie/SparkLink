import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * This script manually migrates the database schema for the Template feature.
 * It's useful when automatic migrations fail due to permission issues.
 */
async function manualMigration() {
  console.log('Running manual database migration...');
  
  try {
    // 1. Check database connection
    console.log('Checking database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    
    // 2. Create templates table if it doesn't exist
    console.log('Creating templates table if needed...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "templates" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "previewImage" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "tier" TEXT NOT NULL,
        "features" JSONB NOT NULL,
        "isDefault" BOOLEAN NOT NULL DEFAULT false,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
      )
    `;
    
    // 3. Add templateId field to profiles if it doesn't exist
    console.log('Adding templateId to profiles table if needed...');
    const profileColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'templateId'
    `;
    
    if (Array.isArray(profileColumns) && profileColumns.length === 0) {
      await prisma.$executeRaw`
        ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "templateId" TEXT,
        ADD COLUMN IF NOT EXISTS "colorScheme" JSONB
      `;
      
      console.log('Added templateId and colorScheme columns to profiles table');
    } else {
      console.log('templateId column already exists in profiles table');
    }
    
    // 4. Create foreign key constraint if needed
    console.log('Adding foreign key constraint if needed...');
    try {
      await prisma.$executeRaw`
        ALTER TABLE "profiles" 
        ADD CONSTRAINT IF NOT EXISTS "profiles_templateId_fkey" 
        FOREIGN KEY ("templateId") 
        REFERENCES "templates"("id") ON DELETE SET NULL ON UPDATE CASCADE
      `;
    } catch (constraintError) {
      console.log('Note: Could not add foreign key constraint. This may be normal if it already exists.');
    }
    
    console.log('Manual migration completed successfully');
  } catch (error) {
    console.error('Error during manual migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
manualMigration()
  .then(() => {
    console.log('Migration complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });

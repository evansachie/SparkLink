import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function addResumeFields() {
  try {
    console.log('Adding resume fields to profiles table...');

    await prisma.$executeRaw`
      ALTER TABLE "profiles" 
      ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "resumePublicId" TEXT,
      ADD COLUMN IF NOT EXISTS "resumeFileName" TEXT,
      ADD COLUMN IF NOT EXISTS "resumeUploadedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "allowResumeDownload" BOOLEAN NOT NULL DEFAULT true
    `;
    
    console.log('Successfully added resume fields to profiles table');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addResumeFields()
  .then(() => {
    console.log('Resume fields migration completed successfully.');
    try {
      console.log('Regenerating Prisma client...');
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('Prisma client regenerated successfully.');
    } catch (error) {
      console.error('Error regenerating Prisma client:', error);
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('Resume fields migration failed:', error);
    process.exit(1);
  });

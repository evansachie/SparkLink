import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function addPasswordProtectionFields() {
  try {
    console.log('Adding password protection fields to Page model...');
    
    // Check if fields already exist
    try {
      const columnCheck = await prisma.$queryRaw`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pages' AND column_name = 'isPasswordProtected'
      `;
      
      const hasField = Array.isArray(columnCheck) && columnCheck.length > 0;
      
      if (hasField) {
        console.log('Password protection fields already exist.');
        return;
      }
    } catch (error) {
      console.log('Error checking columns, continuing with migration:', error);
    }
    
    // Add the new columns
    try {
      console.log('Adding isPasswordProtected column...');
      await prisma.$executeRaw`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "isPasswordProtected" BOOLEAN NOT NULL DEFAULT false`;
      
      console.log('Adding password column...');
      await prisma.$executeRaw`ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "password" TEXT`;
      
      console.log('Successfully added password protection fields to Page model');
    } catch (error) {
      console.error('Error adding columns manually:', error);
      throw error;
    }
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addPasswordProtectionFields()
  .then(() => {
    console.log('Migration completed successfully.');
    
    // Now try to run prisma generate to update the client
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
    console.error('Migration failed:', error);
    process.exit(1);
  });

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function addVerificationSystem() {
  try {
    console.log('Adding verification system to database...');
    
    // Add verification fields to users table
    console.log('Adding verification fields to users table...');
    await prisma.$executeRaw`
      ALTER TABLE "users" 
      ADD COLUMN IF NOT EXISTS "hasVerifiedBadge" BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT NOT NULL DEFAULT 'NONE',
      ADD COLUMN IF NOT EXISTS "verificationData" JSONB,
      ADD COLUMN IF NOT EXISTS "verificationSubmittedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "verificationApprovedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "verificationRejectedAt" TIMESTAMP(3),
      ADD COLUMN IF NOT EXISTS "verificationNotes" TEXT
    `;
    
    // Create verification_requests table
    console.log('Creating verification_requests table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "verification_requests" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "requestType" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "submittedData" JSONB NOT NULL,
        "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "reviewedAt" TIMESTAMP(3),
        "reviewedBy" TEXT,
        "reviewNotes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
      )
    `;
    
    // Add foreign key constraint (check if exists first)
    console.log('Adding foreign key constraint...');
    try {
      await prisma.$executeRaw`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'verification_requests_userId_fkey'
          ) THEN
            ALTER TABLE "verification_requests" 
            ADD CONSTRAINT "verification_requests_userId_fkey" 
            FOREIGN KEY ("userId") 
            REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$;
      `;
    } catch (fkError) {
      console.log('Foreign key constraint may already exist, continuing...');
    }
    
    // Add indexes
    console.log('Adding indexes...');
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "verification_requests_userId_idx" ON "verification_requests"("userId")
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status")
      `;
    } catch (indexError) {
      console.log('Indexes may already exist, continuing...');
    }
    
    console.log('Successfully added verification system to database');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
addVerificationSystem()
  .then(() => {
    console.log('Verification system migration completed successfully.');
    
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
    console.error('Verification system migration failed:', error);
    process.exit(1);
  });

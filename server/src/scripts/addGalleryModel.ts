import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function addGalleryModel() {
  try {
    console.log('Adding Gallery model to database...');
    
    // Check if gallery table already exists
    try {
      const tableCheck = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_name = 'gallery_items'
      `;
      
      const hasTable = Array.isArray(tableCheck) && tableCheck.length > 0;
      
      if (hasTable) {
        console.log('Gallery table already exists.');
        return;
      }
    } catch (error) {
      console.log('Error checking table, continuing with creation:', error);
    }
    
    // Create the gallery_items table
    try {
      console.log('Creating gallery_items table...');
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "gallery_items" (
          "id" TEXT NOT NULL,
          "profileId" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "imageUrl" TEXT NOT NULL,
          "publicId" TEXT NOT NULL,
          "category" TEXT,
          "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "order" INTEGER NOT NULL DEFAULT 0,
          "isVisible" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          
          CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Add foreign key constraint
      console.log('Adding foreign key constraint...');
      await prisma.$executeRaw`
        ALTER TABLE "gallery_items" 
        ADD CONSTRAINT IF NOT EXISTS "gallery_items_profileId_fkey" 
        FOREIGN KEY ("profileId") 
        REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `;
      
      // Add indexes
      console.log('Adding indexes...');
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "gallery_items_profileId_idx" ON "gallery_items"("profileId")
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "gallery_items_category_idx" ON "gallery_items"("category")
      `;
      
      console.log('Successfully created Gallery model in database');
    } catch (error) {
      console.error('Error creating gallery table:', error);
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
addGalleryModel()
  .then(() => {
    console.log('Gallery model migration completed successfully.');
    
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
    console.error('Gallery model migration failed:', error);
    process.exit(1);
  });

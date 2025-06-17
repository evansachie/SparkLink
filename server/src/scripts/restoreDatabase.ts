import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This script is useful when your local database gets into a state
 * where you need to reset and rebuild it completely.
 * 
 * CAUTION: This will delete ALL your local data!
 */
async function resetAndRebuildDatabase() {
  try {
    console.log('WARNING: This will delete all data in your database!');
    console.log('Wait 5 seconds to cancel (Ctrl+C)...');
    
    // Wait for 5 seconds to give time to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('Beginning database reset and rebuild...');
    
    try {
      // First try to delete node_modules/.prisma directory to avoid permission issues
      const prismaClientDir = path.join(process.cwd(), 'node_modules', '.prisma');
      if (fs.existsSync(prismaClientDir)) {
        console.log('Attempting to clear existing Prisma client...');
        try {
          fs.rmSync(prismaClientDir, { recursive: true, force: true });
          console.log('Successfully cleared Prisma client directory.');
        } catch (err) {
          console.warn('Could not remove Prisma client directory. You may need to close any processes using it:', err);
        }
      }
      
      // Force reset the database
      console.log('Resetting database with prisma db push --force-reset...');
      execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
      
      // Generate the client
      console.log('Generating Prisma client...');
      try {
        execSync('npx prisma generate', { stdio: 'inherit' });
      } catch (genError) {
        console.warn('Warning: Error generating Prisma client automatically.', genError);
        console.log('You may need to manually run: npx prisma generate');
      }
      
      console.log('Database has been reset and rebuilt successfully!');
      console.log('You will need to recreate test data.');
      
      process.exit(0);
    } catch (error) {
      console.error('Error during reset:', error);
      
      console.log('\nAlternative manual steps:');
      console.log('1. Close any apps using Prisma (VS Code, etc.)');
      console.log('2. Run: npx prisma db push --force-reset');
      console.log('3. Run: npx prisma generate');
      
      process.exit(1);
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  }
}

resetAndRebuildDatabase();

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * This script helps fix Prisma permission issues by:
 * 1. Deleting the Prisma client directory
 * 2. Regenerating the Prisma client
 * 
 * Run this when you get EPERM errors with Prisma
 */
async function fixPrismaPermissions() {
  try {
    console.log('Starting Prisma client fix...');
    
    // Get paths
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    const prismaClientDir = path.join(nodeModulesPath, '.prisma');
    const prismaClientGenDir = path.join(nodeModulesPath, '@prisma', 'client');
    
    // Check if VS Code is running with processes that might hold locks
    console.log('Checking running processes...');
    let isVSCodeRunning = false;
    
    try {
      const processList = execSync('tasklist', { encoding: 'utf-8' });
      isVSCodeRunning = processList.toLowerCase().includes('code.exe');
    } catch (error) {
      console.log('Could not check processes, continuing anyway');
    }
    
    if (isVSCodeRunning) {
      console.log('\n⚠️ VS Code appears to be running.');
      console.log('VS Code may keep a lock on Prisma files.');
      console.log('Consider closing VS Code before proceeding.\n');
    }
    
    console.log('Press Enter to continue or Ctrl+C to cancel...');
    await new Promise(resolve => {
      process.stdin.once('data', () => {
        resolve(true);
      });
    });
    
    // Step 1: Delete Prisma client directories
    console.log('Removing existing Prisma client...');
    
    if (fs.existsSync(prismaClientDir)) {
      try {
        fs.rmSync(prismaClientDir, { recursive: true, force: true });
        console.log('✅ Successfully removed .prisma client directory');
      } catch (error) {
        console.error('Failed to remove .prisma directory:', error);
      }
    } else {
      console.log('No .prisma directory found, skipping');
    }
    
    if (fs.existsSync(prismaClientGenDir)) {
      try {
        fs.rmSync(prismaClientGenDir, { recursive: true, force: true });
        console.log('✅ Successfully removed @prisma/client directory');
      } catch (error) {
        console.error('Failed to remove @prisma/client directory:', error);
      }
    } else {
      console.log('No @prisma/client directory found, skipping');
    }
    
    // Step 2: Regenerate the client
    console.log('\nRegenerating Prisma client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Successfully regenerated Prisma client');
    } catch (error) {
      console.error('Failed to regenerate Prisma client:', error);
      console.log('\nYou may need to restart your computer to release file locks.');
      process.exit(1);
    }
    
    console.log('\n✅ Prisma client has been fixed successfully!');
    console.log('You can now start your application.');
    
  } catch (error) {
    console.error('Error fixing Prisma permissions:', error);
    process.exit(1);
  }
}

fixPrismaPermissions();

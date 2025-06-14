import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabaseSchema() {
  console.log('Checking database schema...');
  
  try {
    // Test connection
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Connected to database');
    
    // Check if User table exists and has subscription fields
    try {
      const result = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users'
      `;
      console.log('Columns in users table:', result);
    } catch (e) {
      console.error('Error querying schema:', e);
    }
    
    // Log current schema
    const dbPath = path.join(__dirname, '..', '..', 'prisma', 'schema.prisma');
    console.log('Reading schema file:', dbPath);
    
    try {
      const schemaContent = fs.readFileSync(dbPath, 'utf-8');
      console.log('Current schema:', schemaContent);
    } catch (e) {
      console.error('Error reading schema file:', e);
    }
    
    console.log('\nPlease run the following command to update your database:');
    console.log('npx prisma db push');
    
  } catch (error) {
    console.error('Database check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseSchema()
  .then(() => {
    console.log('Database check completed');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Error during database check:', e);
    process.exit(1);
  });

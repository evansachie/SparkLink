import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

// Path to prisma schema file
const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');

console.log('Generating Prisma client from schema...');
console.log(`Schema path: ${schemaPath}`);

try {
  // First, save the schema changes
  console.log('Running prisma db push with --accept-data-loss flag...');
  execSync(`npx prisma db push --accept-data-loss`, { stdio: 'inherit' });
  
  // Then generate the client
  console.log('Generating Prisma client...');
  execSync(`npx prisma generate`, { stdio: 'inherit' });
  
  console.log('✅ Prisma client generated successfully.');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error);
  process.exit(1);
}

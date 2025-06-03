#!/bin/bash
echo "Starting deployment..."

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Push database schema
echo "Updating database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "Building application..."
npm run build

echo "Deployment complete!"

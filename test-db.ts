const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Connected successfully to the database!');
  } catch (err) {
    console.error('❌ Failed to connect to the database.');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
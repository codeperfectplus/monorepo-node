const { PrismaClient } = require('@prisma/client')

const globalForPrisma = globalThis

const prisma =
  globalForPrisma.__sharedPrismaClient ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__sharedPrismaClient = prisma
}

module.exports = {
  prisma,
  PrismaClient,
}

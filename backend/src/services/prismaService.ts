import { PrismaClient } from '../prisma';
import { env } from '../config/env';
import { logger } from '../Logger/winston';

class PrismaService extends PrismaClient {
    constructor() {
        super({
            log: env.NODE_ENV === 'production'
                ? ['error', 'warn']
                : ['query', 'error', 'warn']
        });
    }

    async connectDB() {
        try {
            await this.$connect();
            logger.info('Prisma connected to PostgreSQL');
        } catch (error) {
            logger.error('Prisma connection error', error);
            throw error;
        }
    }

    async disconnectDB() {
        try {
            await this.$disconnect();
            logger.info('Prisma disconnected');
        } catch (error) {
            logger.error('Prisma disconnect error', error);
        }
    }
}

export const prismaService = new PrismaService();
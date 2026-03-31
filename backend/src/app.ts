import { Server } from "http";

import { logger } from "./Logger/winston";
import { launchServer } from "./server";
import {prismaService} from "./services/prismaService";
import {assertAwsCredentialsConfigured} from "./utils/awsClient";

let server: Server;
let isShuttingDown = false;

process.on('uncaughtException', async (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    await shutdown('UNCAUGHT EXCEPTION');
});

logger.info('Starting server initialization...');

(async () => {
    try {
        await prismaService.connectDB();
        logger.info('PostgreSQL connected successfully');

        await assertAwsCredentialsConfigured();
        logger.info('AWS credentials resolved successfully');

        server = await launchServer();
    } catch (err) {
        logger.error('Server initialization failed', err);
        process.exit(1);
    }
})();

const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received. Shutting down gracefully...`);

    try {
        if (server) {
            await new Promise<void>((resolve) => {
                server.close(() => {
                    logger.info('HTTP server closed');
                    resolve();
                });
            });
        }

        await prismaService.disconnectDB();
        logger.info('Database disconnected');

        process.exit(0);
    } catch (err) {
        logger.error('Error during shutdown:', err);
        process.exit(1);
    }
};

process.on('unhandledRejection', async (err: Error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    await shutdown('UNHANDLED REJECTION');
});

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";
import { createApp } from "./app";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Care Concern API listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}; shutting down`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

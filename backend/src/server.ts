import app from './app';
import { config, isDev } from './config';
import prisma from './config/db';
import { closeRedis, getRedis } from './config/redis';
import { connectProducer, disconnectProducer } from './workers/emailQueue';
import { startEmailWorker, closeEmailWorker } from './workers/emailWorker';

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);

  if (isDev) {
    console.log(`Health check: http://localhost:${config.port}/health`);
    console.log(`Swagger docs: http://localhost:${config.port}/api-docs`);
  }
});

// Initialize Redis connection
getRedis();

// Initialize Kafka producer + consumer
(async () => {
  try {
    await connectProducer();
    await startEmailWorker();
  } catch (err) {
    console.error('Failed to start Kafka services:', err);
  }
})();

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    try {
      await closeEmailWorker();
      console.log('Kafka consumer closed');

      await disconnectProducer();
      console.log('Kafka producer closed');

      await prisma.$disconnect();
      console.log('Database connection closed');

      await closeRedis();
      console.log('Redis connection closed');

      console.log('Graceful shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

export default server;

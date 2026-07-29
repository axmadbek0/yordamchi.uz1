import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { prisma } from './prisma';

const SHUTDOWN_TIMEOUT_MS = 10_000;

export function registerProcessHandlers(
  httpServer: HttpServer,
  io: SocketServer
): void {
  let isShuttingDown = false;

  const shutdown = async (signal: string, exitCode = 0): Promise<void> => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`[shutdown] ${signal} qabul qilindi. Server to'xtatilmoqda...`);

    const forceExitTimer = setTimeout(() => {
      console.error('[shutdown] Vaqt tugadi. Majburiy chiqish.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExitTimer.unref();

    try {
      io.close();
      await new Promise<void>((resolve, reject) => {
        httpServer.close((err) => (err ? reject(err) : resolve()));
      });
      await prisma.$disconnect();
      console.log('[shutdown] Server xavfsiz to\'xtatildi.');
      clearTimeout(forceExitTimer);
      process.exit(exitCode);
    } catch (error) {
      console.error('[shutdown] To\'xtatishda xato:', error);
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    console.error('[unhandledRejection]', reason);
    void shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('[uncaughtException]', error);
    void shutdown('uncaughtException', 1);
  });
}

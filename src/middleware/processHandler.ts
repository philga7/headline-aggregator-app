// src/middleware/processHandler.ts

const cleanup = (): void => {
  try {
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

const initializeProcessHandlers = (): void => {
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
};

export { initializeProcessHandlers };

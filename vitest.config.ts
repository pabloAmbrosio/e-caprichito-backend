import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
    reporters : ['verbose'],
    // setupFiles: ['./tests/setup.ts'],
    env: {
      DATABASE_URL: 'postgresql://caprichito:caprichito123@localhost:5433/caprichito_test?schema=public',
      JWT_SECRET: 'test-secret-key',
      COOKIE_SECRET: 'test-cookie-secret',
      FRONTEND_URL: 'http://localhost:5173',
      PORT: '3001',
      SMS_MODE: 'log',
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_PASSWORD: 'caprichito123',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});

import cors, { CorsOptions } from 'cors';

function parseAllowedOrigins(): string[] {
  const fromList =
    process.env.CORS_ORIGINS?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? [];

  const defaults = [
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://localhost:5174',
  ].filter((v): v is string => Boolean(v));

  return [...new Set([...fromList, ...defaults])];
}

export const allowedOrigins = parseAllowedOrigins();

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Postman / server-to-server — Origin bo'lmasligi mumkin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: '${origin}' domeniga ruxsat berilmagan`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

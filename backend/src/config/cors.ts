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
    'https://yordamchimed.uz',
    'https://www.yordamchimed.uz',
  ].filter((v): v is string => Boolean(v));

  return [...new Set([...fromList, ...defaults])];
}

export const allowedOrigins = parseAllowedOrigins();

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Mobil ilovalar, Postman, Server-to-server so'rovlarda Origin bo'lmaydi
    if (!origin) {
      callback(null, true);
      return;
    }

    // Agar CORS_ORIGINS da * bo'lsa yoki dev muhitida yoki oq ro'yxatda bo'lsa yoki LAN IP bo'lsa
    if (
      process.env.CORS_ORIGINS === '*' ||
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/.test(
        origin
      )
    ) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS: '${origin}' domeniga ruxsat berilmagan`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

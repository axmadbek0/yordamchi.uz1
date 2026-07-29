import rateLimit from 'express-rate-limit';

/** Global API: 15 daqiqada 100 so'rov / IP */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    statusCode: 429,
    message: 'Juda ko\'p so\'rov yuborildi. Iltimos, birozdan keyin qayta urinib ko\'ring.',
  },
});

/** AI endpoint'lar: 1 daqiqada 5 so'rov */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({
      message: 'Juda ko\'p so\'rov yuborildi. Iltimos, 1 daqiqadan keyin qayta urinib ko\'ring.',
    });
  },
});

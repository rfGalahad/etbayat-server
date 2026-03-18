import rateLimit from 'express-rate-limit';

// Basic IP-based rate limiter for all API routes.
// Adjust windowMs / max if you need stricter or looser limits.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});


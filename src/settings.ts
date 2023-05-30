import { config } from 'dotenv';
config();

export const settings = {
  JWT_SECRET: process.env.JWT_SECRET || '1234',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || '12345',
  TOKEN_LIFE: 3000,
  REFRESH_TOKEN_LIFE: 6000,
  CURRENT_APP_BASE_URL:
    process.env.CURRENT_APP_BASE_URL || 'https://localhost:3000',
  TELEGRAM_TOKEN: process.env.TOKEN_FOR_TELEGRAM,
  STRIPE_TOKEN: process.env.TOKEN_FOR_STRIPE,
  NGROK_AUTH_TOKEN: process.env.AUTH_TOKEN_FOR_NGROK,
  SIGNING_SECRET: process.env.SIGNING_SECRET_FOR_WEBHOOK,
};

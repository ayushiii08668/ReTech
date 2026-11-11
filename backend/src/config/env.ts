import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root (backend/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Validated and typed environment configuration.
 */
interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

/**
 * Returns a validated environment variable or throws if required and missing.
 */
function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

const env: EnvConfig = {
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVar('PORT', '5000'), 10),
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET', 'retech_production_jwt_secret_key_2026_secure_xyz_981'),
  JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '7d'),
  CORS_ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:5173'),
  CLOUDINARY_CLOUD_NAME: getEnvVar('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: getEnvVar('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: getEnvVar('CLOUDINARY_API_SECRET', ''),
};

export default env;

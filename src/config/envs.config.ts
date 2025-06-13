import 'dotenv/config';
import * as joi from 'joi';

interface EnvsVars {
  SERVER_PORT: number;
  NATS_SERVERS: string[];
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
  ENCRYPTION_KEY: string;
  ENCRYPTION_ENABLED: boolean;
  CORS_ORIGINS: string[];
}

const envsSchema = joi
  .object({
    PORT: joi.number().default(3000),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USERNAME: joi.string().required(),
    DB_PASSWORD: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_SYNCHRONIZE: joi.boolean().default(true),
    ENCRYPTION_KEY: joi.string().required(),
    ENCRYPTION_ENABLED: joi.boolean().required(),
  })
  .unknown(true);

const validationResult = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (validationResult.error)
  throw new Error(`Config validation error: ${validationResult.error.message}`);

const envVars: EnvsVars = validationResult.value as EnvsVars;

export const envs = {
  server: {
    port: envVars.SERVER_PORT,
  },
  db: {
    host: envVars.DB_HOST,
    port: envVars.DB_PORT,
    username: envVars.DB_USERNAME,
    password: envVars.DB_PASSWORD,
    name: envVars.DB_NAME,
    synchronize: envVars.DB_SYNCHRONIZE,
  },
  messaging: {
    servers: envVars.NATS_SERVERS,
  },
  encryption: {
    key: envVars.ENCRYPTION_KEY,
    enabled: envVars.ENCRYPTION_ENABLED,
  },
};

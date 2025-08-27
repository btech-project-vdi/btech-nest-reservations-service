import * as dotenv from 'dotenv';
import * as joi from 'joi';

if (process.env.NODE_ENV === 'local') {
  const envFile = '.env.local';
  const result = dotenv.config({
    path: `${process.cwd()}/${envFile}`,
  });
  if (result.error)
    console.error(
      `Error crítico al cargar el archivo .env.local: ${result.error.message}`,
    );
}

interface EnvsVars {
  SERVER_PORT: number;
  NATS_SERVERS: string[];
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_SYNCHRONIZE: boolean;
  EMAILS_GRPC_URL: string;
  SUBSCRIBERS_GRPC_URL: string;
  ENCRYPTION_KEY: string;
  ENCRYPTION_ENABLED: boolean;
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
    EMAILS_GRPC_URL: joi.string().required(),
    SUBSCRIBERS_GRPC_URL: joi.string().required(),
    ENCRYPTION_KEY: joi.string().required(),
    ENCRYPTION_ENABLED: joi.boolean().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
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
  grpc: {
    emailsUrl: envVars.EMAILS_GRPC_URL,
    subscribersUrl: envVars.SUBSCRIBERS_GRPC_URL,
  },
  messaging: {
    servers: envVars.NATS_SERVERS,
  },
  encryption: {
    key: envVars.ENCRYPTION_KEY,
    enabled: envVars.ENCRYPTION_ENABLED,
  },
};

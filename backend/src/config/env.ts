import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().transform(Number).default("3000"),
  MONGODB_URI: z.string().url(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "debug"]).default("info"),

  AZURE_API_KEY: z.string().min(1),
  AZURE_BASE_URL: z.string().url(),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error("❌ Invalid environment variables:", env.error.format());
  process.exit(1);
}

export const config = {
  port: env.data.PORT,
  mongodbUri: env.data.MONGODB_URI,
  nodeEnv: env.data.NODE_ENV,
  logLevel: env.data.LOG_LEVEL,
  azure: {
    apiKey: env.data.AZURE_API_KEY,
    baseUrl: env.data.AZURE_BASE_URL,
  },
} as const;

export type Config = typeof config;

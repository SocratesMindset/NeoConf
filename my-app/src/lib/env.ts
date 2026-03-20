import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  UPLOAD_DIR: z.string().min(1).default("storage/uploads/articles"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  SESSION_TTL_DAYS: process.env.SESSION_TTL_DAYS,
});

if (!parsedEnv.success) {
  throw new Error(
    `Invalid environment variables: ${parsedEnv.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ")}`,
  );
}

export const env = parsedEnv.data;

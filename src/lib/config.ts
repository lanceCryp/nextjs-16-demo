import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL 必须设置"),
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET 必须设置（npx auth secret 生成）"),
  AUTH_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_ENABLE_I18N: z.enum(["true", "false"]).default("false"),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

// 启动时集中校验，失败即快速退出（fail-fast）
export function getConfig(): AppConfig {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("[config] 环境变量校验失败:", JSON.stringify(parsed.error.flatten().fieldErrors));
    throw new Error("Invalid environment configuration");
  }
  cached = parsed.data;
  return cached;
}

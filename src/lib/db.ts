import { PrismaClient } from "@prisma/client";

// 开发环境复用单例，避免热重载产生过多连接
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * 连接池 / 生产切换说明
 * ------------------------------------------------------------------
 * 1) 当前用 SQLite（文件型数据库），没有"连接池"概念；上面的单例即可。
 *
 * 2) 切换到 Postgres（生产推荐）时，连接池通过 DATABASE_URL 的查询参数控制，
 *    例如：
 *      postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20
 *    - connection_limit：连接池最大连接数（默认 ~ 机器核数 * 2 + 1）
 *    - 在 Serverless / 边缘（如 Vercel）部署时，建议配合连接池中间件（PgBouncer），
 *      并在 URL 追加 ?pgbouncer=true&connection_limit=1，避免瞬连打满。
 *
 * 3) 若要在 Prisma 侧显式控制，也可用 datasource 的 preview 能力或在实例化时传
 *    `new PrismaClient({ datasources: { db: { url } } })`。本项目为演示保持简单，
 *    统一从环境变量读取 DATABASE_URL。
 */


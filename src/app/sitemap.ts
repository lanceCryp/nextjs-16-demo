import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

// 读库生成站点地图，标记为动态渲染，避免 cacheComponents 预渲染期访问 connection() 报错
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await prisma.post
    .findMany({ where: { published: true }, select: { slug: true } })
    .catch(() => []);
  return [
    { url: "http://localhost:3000" },
    { url: "http://localhost:3000/blog" },
    ...posts.map((p) => ({ url: `http://localhost:3000/blog/${p.slug}` })),
  ];
}

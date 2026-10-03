import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "博客 | Next.js 演示",
  description: "静态生成的文章列表（SSG）",
};

// 数据库读取放在 Suspense 边界内：预渲染时先出 fallback，真实数据再流式补上，
// 避免 cacheComponents 因「预渲染期间访问 connection()」而报错。
async function BlogList() {
  let posts: { slug: string; title: string; excerpt: string }[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true, title: true, excerpt: true },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    posts = [];
  }

  if (posts.length === 0) {
    return (
      <p className="text-gray-500">
        暂无已发布文章。运行 <code>pnpm prisma db seed</code> 或手动插入数据后即可见。
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((p) => (
        <li key={p.slug} className="border rounded p-3">
          <Link href={`/blog/${p.slug}`} className="font-medium">
            {p.title}
          </Link>
          <p className="text-sm text-gray-500">{p.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}

export default async function BlogListPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">博客（SSG 静态生成）</h1>
      <Suspense fallback={<p className="text-gray-500">加载文章列表…（流式占位）</p>}>
        <BlogList />
      </Suspense>
    </div>
  );
}

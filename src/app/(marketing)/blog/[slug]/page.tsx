import { notFound } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

// dynamicParams = false：只允许访问 generateStaticParams 预生成的 slug；
// 其它 slug 直接 404，不会按需渲染（更可控、更贴近纯静态产出）
export const dynamicParams = false;

// ISR：该页每 60 秒增量再生一次（经典写法，cacheComponents 关闭后恢复）
export const revalidate = 60;

// SSG：构建期为已发布文章预生成静态参数
export async function generateStaticParams() {
  try {
    const posts = await prisma.post.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post
    .findUnique({ where: { slug }, select: { title: true, excerpt: true } })
    .catch(() => null);
  if (!post) return { title: "未找到文章" };
  return { title: post.title, description: post.excerpt };
}

// 取数放进 Suspense 边界：先出 fallback，文章正文再流式补上（流式渲染体验）。
// ISR 由路由段 export const revalidate = 60 控制（cacheComponents 关闭后恢复经典写法）。
async function PostContent({ slug }: { slug: string }) {
  const post = await prisma.post.findUnique({ where: { slug } }).catch(() => null);
  if (!post) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="text-gray-500">{post.excerpt}</p>
      <div className="whitespace-pre-wrap">{post.content}</div>
      <p className="text-xs text-gray-400">
        本页使用 ISR：export const revalidate = 60（每 60s 再生）
      </p>
    </>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <article className="space-y-3">
      <Link href="/blog" className="text-sm text-gray-500">
        ← 返回博客
      </Link>
      <Suspense fallback={<p className="text-gray-500">加载文章…（流式占位）</p>}>
        <PostContent slug={slug} />
      </Suspense>
    </article>
  );
}

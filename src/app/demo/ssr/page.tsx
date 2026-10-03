import { cookies, headers } from "next/headers";
import { unstable_noStore } from "next/cache";
import { prisma } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSR 演示 | Next.js 全功能演示",
  description: "显式使用 cookies()/headers() 强制动态渲染，并演示 unstable_noStore()",
};

// 显式声明为动态渲染（SSR）：每次请求都在服务端执行
export const dynamic = "force-dynamic";

export default async function SsrDemoPage() {
  // headers()/cookies() 是请求级 API，调用后该路由自动变为动态（SSR）
  const h = await headers();
  const c = await cookies();

  const userAgent = h.get("user-agent") ?? "(空)";
  const cookieKeys = c.getAll().map((ck) => ck.name);
  const forwardedFor = h.get("x-forwarded-for") ?? "(本地)";

  // unstable_noStore()：强制本条数据读取不参与任何缓存（始终最新）
  unstable_noStore();
  const postCount = await prisma.post.count();

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-gray-500">
        ← 返回首页
      </Link>
      <h1 className="text-2xl font-bold">SSR 显式渲染演示</h1>
      <p className="text-sm text-gray-500">
        <code>{'export const dynamic = "force-dynamic"'}</code> + 调用
        headers()/cookies()，每次请求都走服务端渲染。
      </p>

      <div className="border rounded p-4 space-y-2 text-sm">
        <div>
          <span className="font-medium">User-Agent：</span>
          <code className="break-all">{userAgent}</code>
        </div>
        <div>
          <span className="font-medium">X-Forwarded-For：</span>
          <code>{forwardedFor}</code>
        </div>
        <div>
          <span className="font-medium">Cookie 名：</span>
          {cookieKeys.length ? cookieKeys.join(", ") : "(无)"}
        </div>
        <div>
          <span className="font-medium">文章总数（unstable_noStore 强制实时读取）：</span>
          {postCount}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        刷新本页可见 User-Agent 等随请求变化；postCount 因 unstable_noStore() 不会被缓存。
      </p>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";

// 请求级数据（读 cookie）必须放在 Suspense 内，否则 cacheComponents 预渲染会因
// 「访问未缓存数据」而报错。预渲染时先出 fallback，会话信息再流式补上。
async function SessionHeader() {
  const session = await auth();
  return (
    <header className="flex gap-4 p-4 border-b items-center">
      <Link href="/gallery">画廊</Link>
      <Link href="/dashboard">后台</Link>
      <Link href="/cart">购物车</Link>
      {session?.user ? (
        <span className="ml-auto text-sm text-gray-600">{session.user.email}</span>
      ) : (
        <Link href="/login" className="ml-auto text-sm">
          登录
        </Link>
      )}
    </header>
  );
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<div className="p-4 border-b text-sm text-gray-400">加载会话…</div>}>
        <SessionHeader />
      </Suspense>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

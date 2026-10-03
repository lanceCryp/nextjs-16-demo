import Link from "next/link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex gap-4 p-4 border-b items-center">
        <Link href="/">首页</Link>
        <Link href="/blog">博客</Link>
        <Link href="/gallery">画廊</Link>
        <Link href="/dashboard">后台</Link>
        <Link href="/login">登录</Link>
        <Link href="/health">健康检查</Link>
      </header>
      <main className="flex-1 p-6">{children}</main>
      <footer className="p-4 border-t text-sm text-gray-500">Next.js 全功能演示站</footer>
    </div>
  );
}

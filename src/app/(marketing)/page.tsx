import Link from "next/link";
import type { Metadata } from "next";
import DynamicDemo from "@/components/DynamicDemo";

export const metadata: Metadata = {
  title: "首页 | Next.js 全功能演示",
  description: "覆盖路由、渲染、服务端能力、全栈数据、性能体验和进阶特性六大域。",
};

const features = [
  { href: "/blog", name: "博客", desc: "SSG + 动态路由 + generateStaticParams + ISR + dynamicParams" },
  { href: "/gallery", name: "画廊", desc: "并行路由 + 拦截路由（模态框）+ next/image" },
  { href: "/dashboard", name: "后台", desc: "受保护页面 + Auth.js 会话" },
  { href: "/demo/ssr", name: "SSR 演示", desc: "cookies()/headers() 强制动态 + unstable_noStore" },
  { href: "/demo/cache", name: "缓存", desc: "unstable_cache：tags + revalidate 多级缓存" },
  { href: "/api/posts", name: "API", desc: "Route Handlers（缓存 vs no-store）" },
  { href: "/api/transaction", name: "事务", desc: "Prisma $transaction 原子写 + 回滚演示（POST）" },
  { href: "/api/fetch-demo", name: "fetch 缓存", desc: "next:{revalidate,tags} vs no-store（GET）" },
  { href: "/api/edge", name: "Edge", desc: "Edge Runtime 接口示例" },
  { href: "/health", name: "健康", desc: "/health 与 /ready 探针" },
  { href: "/demo/nav", name: "导航钩子", desc: "useRouter / usePathname / useSearchParams 客户端演示" },
  { href: "/demo/draft", name: "草稿预览", desc: "Draft Mode：绕过静态缓存预览未发布文章" },
  { href: "/demo/i18n", name: "国际化", desc: "i18n：Cookie 协商语言偏好，URL 不带语言前缀（中/英）" },
  { href: "/guide", name: "避坑指南", desc: "本项目踩过的坑：症状 / 根因 / 解决方案，可搜索" },
  { href: "/demo/theme", name: "主题切换", desc: "next-themes 明暗模式 + 品牌配色双轴，防 FOUC" },
];

export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Next.js 全功能体验站点</h1>
      <p className="text-gray-600">
        一个站点覆盖路由、渲染、服务端能力、全栈数据、性能与体验、进阶特性六大能力域，共约 43 项可落地特性。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <div className="font-medium">{f.name}</div>
            <div className="text-sm text-gray-500">{f.desc}</div>
          </Link>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">性能与体验演示</h2>
        <DynamicDemo />
        <p className="text-xs text-gray-400">
          generateViewport（主题色）+ next/script（/demo-analytics.js 延迟注入）已在根布局全局生效，可在浏览器开发者工具查看。
        </p>
      </section>
    </div>
  );
}

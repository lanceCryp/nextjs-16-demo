import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeControls } from "@/components/theme-controls";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js 全功能演示",
  description: "覆盖路由、渲染、服务端能力、全栈数据、性能体验和进阶特性六大域。",
};

// generateViewport：主题色等 viewport 元信息已从 metadata 拆分到独立导出（Next 14+）
// 亮/暗各给一个，浏览器地址栏跟随系统配色
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

// 防主题闪烁（FOUC）：这段脚本在首屏绘制前同步执行，
// 提前把品牌色写到 <html> 上，避免刷新瞬间先闪一下默认配色。
// 明暗轴由 next-themes 内置的同款脚本处理，这里只补品牌色轴。
const PALETTE_SCRIPT = `try{var p=localStorage.getItem('palette');if(p)document.documentElement.setAttribute('data-palette',p);}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning：主题类由客户端脚本添加，服务端渲染时并不存在
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PALETTE_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          {/* 全局主题切换器：明暗三态 + 品牌配色 */}
          <ThemeControls />
        </ThemeProvider>
        {/* next/script：第三方脚本按需加载，afterInteractive 表示页面可交互后再注入 */}
        <Script src="/demo-analytics.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

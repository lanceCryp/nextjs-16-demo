import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components 特性：启用后 "use cache" 指令才可用（Next 16 需显式开启）。
  // ⚠️ 该特性会改变缓存语义、且与路由段级 `export const revalidate` 冲突，
  //    此前引发一连串预渲染/段配置报错，故先关闭。
  //    关闭后：ISR 用经典 `export const revalidate`；"use cache" 指令不可用，
  //    相关演示改用 unstable_cache。需要时可改回 true 重新启用。
  cacheComponents: false,

  // 部署配置：standalone 在 next build 后生成 .next/standalone 自包含服务包
  //（含 node 运行时与依赖，适合 Docker 部署，镜像更小）。仅影响构建产物，不影响 dev。
  // 若需纯静态导出，可改为 output: "export"，但本项目用到了 Server Actions /
  // Route Handlers / Auth.js / 动态渲染，纯静态导出不兼容，需先改造为纯静态应用。
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  // next.config 特性演示：redirects / rewrites / headers
  async redirects() {
    return [{ source: "/old-blog", destination: "/blog", permanent: false }];
  },
  async rewrites() {
    return [{ source: "/dashboard-redirect", destination: "/dashboard" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
  },
};

export default nextConfig;

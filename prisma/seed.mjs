import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    slug: "hello-next",
    title: "你好，Next.js",
    excerpt: "App Router 与 Server Components 入门",
    content:
      "Next.js 16 默认使用 App Router。页面即文件，布局可嵌套，Server Component 在服务端渲染，Client Component 用 'use client' 标注。",
    published: true,
  },
  {
    slug: "full-stack",
    title: "全栈实战",
    excerpt: "从 Route Handler 到 Server Action",
    content:
      "用 Route Handlers 暴露 REST 接口，用 Server Actions 直接在表单里提交变更，无需手写 fetch。",
    published: true,
  },
  {
    slug: "caching",
    title: "缓存策略",
    excerpt: "fetch 缓存、revalidate 与 use cache",
    content:
      "Next 15+ 默认不缓存 fetch；用 revalidate / revalidateTag 主动失效，或用 use cache 指令声明缓存。",
    published: true,
  },
  // 未发布草稿：默认视图下不可见；开启 Draft Mode 后可在 /demo/draft 预览
  {
    slug: "draft-mode",
    title: "草稿：Draft Mode 预览",
    excerpt: "这篇文章尚未发布，默认视图看不到",
    content:
      "这是未发布的草稿文章。正式视图下 /blog 不会列出它，直接访问也会被守卫拦成 404。\n\n开启草稿模式后（写入 __prerender_bypass cookie，绕过静态缓存），即可在 /demo/draft 看到它并预览正文 —— CMS 的「预览未发布内容」正是这么实现的。",
    published: false,
  },
];

const products = [
  { slug: "tshirt", title: "纯棉 T 恤", description: "舒适透气的基础款", price: 9900, imageUrl: "https://picsum.photos/seed/tshirt/400/300" },
  { slug: "mug", title: "陶瓷马克杯", description: "办公桌好物", price: 4900, imageUrl: "https://picsum.photos/seed/mug/400/300" },
  { slug: "book", title: "技术书", description: "Next.js 全功能图解", price: 12900, imageUrl: "https://picsum.photos/seed/book/400/300" },
];

async function main() {
  for (const p of posts) {
    // published 以数组里声明的值为准（草稿必须为 false），否则重跑 seed 会把草稿误改成已发布
    await prisma.post.upsert({
      where: { slug: p.slug },
      update: {
        published: p.published,
        title: p.title,
        excerpt: p.excerpt,
        content: p.content,
      },
      create: p,
    });
  }
  for (const p of products) {
    // update 带上 imageUrl，保证重跑 seed 也能补上图片字段
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { imageUrl: p.imageUrl },
      create: p,
    });
  }
  console.log("seed 完成：写入 3 篇已发布文章 + 1 篇未发布草稿（draft-mode）+ 3 个商品（含 imageUrl）");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

// Next.js 16 踩坑清单：全部来自本项目真实踩过并修复的问题（见 .workbuddy/memory 日志）
// 单独放数据文件，页面只负责渲染 —— 便于后续增补。

export type Pitfall = {
  id: string;
  title: string;
  category: PitfallCategory;
  /** 症状 / 报错原文 */
  symptom: string;
  /** 根因 */
  cause: string;
  /** 解决方案 */
  solution: string;
  /** 关键代码或配置片段 */
  code?: string;
  /** 代码片段的语言标注 */
  lang?: string;
};

export const categories = [
  "配置",
  "路由",
  "渲染与缓存",
  "数据层",
  "React Hooks",
  "样式与主题",
  "TypeScript",
] as const;

export type PitfallCategory = (typeof categories)[number];

export const pitfalls: Pitfall[] = [
  // ───────────────────────────── 配置 ─────────────────────────────
  {
    id: "rewrite-permanent",
    title: "rewrites 里写 permanent 直接让 dev 启动失败",
    category: "配置",
    symptom:
      "Error: Invalid rewrite found … invalid field: permanent for route",
    cause:
      "rewrites() 不支持 permanent 字段。Next 只有 redirects() 支持 permanent / status，rewrite 只能配 destination、has、missing。",
    solution:
      "把 permanent 从 rewrite 里删掉；确实需要 301/308 语义就用 redirects() 代替 rewrites()。",
    code: `// next.config.ts
async rewrites() {
  return [
    {
      source: "/old-blog/:slug",
      destination: "/blog/:slug",   // ✅ 没有 permanent
    },
  ];
}`,
    lang: "ts",
  },
  {
    id: "cache-components-switch",
    title: "cacheComponents 一个开关引发一整串派生报错",
    category: "配置",
    symptom:
      "开启后连报：Route segment config revalidate is not compatible with nextConfig.cacheComponents / Next.js encountered uncached data during prerendering",
    cause:
      "cacheComponents 是全局开关，会改变全站渲染模型。开了之后：① `export const revalidate` 段配置失效；② 任何在组件顶层 await prisma/cookies/headers 的页面都会在预渲染期报错。影响面远超预期。",
    solution:
      "先评估项目是否真的需要它。生产型项目建议保持关闭走经典模式（revalidate + unstable_cache）；要用 `use cache` 再开，并全局 grep `prisma.|cookies()|headers()|auth()` 把顶层读取改成 Suspense 包裹或 force-dynamic。",
    code: `// next.config.ts —— 稳定优先
const nextConfig: NextConfig = {
  cacheComponents: false,
};

// 开了之后，凡顶层读库/读 cookie 的页面二选一：
// A) 抽异步子组件 + <Suspense>（保留流式渲染）
// B) export const dynamic = "force-dynamic"（元数据路由等无法 Suspense 的场景）`,
    lang: "ts",
  },
  {
    id: "ppr-merged",
    title: "experimental.ppr 已被废弃，PPR 只能靠 cacheComponents 开启",
    category: "配置",
    symptom: "配了 experimental.ppr 却没效果 / 报未知配置项",
    cause:
      "Next 16 里 PPR 已合并进 cacheComponents。类型定义里明确标注 experimental.ppr 为 @deprecated。",
    solution:
      "不要单独找 PPR 开关。确认 `cacheComponents: true` 是开启前提，再评估它带来的 revalidate 段配置冲突等连锁影响。",
    code: `// node_modules/next/dist/server/config-shared.d.ts 原文：
/**
 * @deprecated This configuration option has been merged into \`cacheComponents\`.
 * The Partial Prerendering feature is still available via \`cacheComponents\`.
 */
ppr?: ExperimentalPPRConfig;`,
    lang: "ts",
  },

  // ───────────────────────────── 路由 ─────────────────────────────
  {
    id: "middleware-to-proxy",
    title: "middleware 文件约定在 Next 16 已废弃",
    category: "路由",
    symptom:
      "⚠ The middleware file convention is deprecated. Please use proxy instead",
    cause: "Next 16 起 middleware.ts 改名 proxy.ts，默认走 Node.js 运行时。",
    solution:
      "文件改名 src/proxy.ts，导出函数从 `middleware` 改为 `proxy`，config.matcher 写法不变。改完重启 dev（热更新不生效）。",
    code: `// src/proxy.ts
export async function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};`,
    lang: "ts",
  },
  {
    id: "middleware-imports-prisma",
    title: "middleware 里 import 了 auth/Prisma，Edge 运行时直接崩",
    category: "路由",
    symptom: "一访问受保护路由就报连不上数据库 / 模块在 Edge 不可用",
    cause:
      "`export { auth as middleware }` 会把 auth.ts 一起打进 Edge bundle，连带引入 Prisma 适配器，而 SQLite/Node 依赖在 Edge 根本跑不了。",
    solution:
      "middleware 绝不 import @/auth。JWT 策略下用 getToken 只解码 cookie 即可，不连库。",
    code: `// ❌ 会把 Prisma 拖进 Edge
export { auth as middleware };

// ✅ 只解码 cookie，不连库
import { getToken } from "next-auth/jwt";

const token = await getToken({ req, secret: process.env.AUTH_SECRET });
if (!token?.sub) return NextResponse.redirect(new URL("/login", req.url));
return NextResponse.next();`,
    lang: "ts",
  },
  {
    id: "root-dynamic-segment-hijacks-404",
    title: "根级 [lang] 动态段会捕获任意一级路径，404 失效",
    category: "路由",
    symptom: "访问不存在的 /foo 不再 404，反而渲染出语言页面",
    cause:
      "app/[lang]/page.tsx 位于根层级，Next 会用它匹配任何单段路径，/foo 被当作 lang=\"foo\"。",
    solution:
      "在 layout 和 page 里都做白名单校验，非法值直接 notFound()。这层守卫不能省。",
    code: `export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

// layout 与 page 都要校验
if (!isLocale(lang)) notFound();`,
    lang: "ts",
  },
  {
    id: "intercept-modal-cannot-close",
    title: "拦截路由模态框点关闭关不掉",
    category: "路由",
    symptom: "点「关闭」后面板还在，路由也没变",
    cause:
      "用了 `<Link href=\"/gallery\">`，但模态态下 children slot 本来就是 /gallery，软导航回同一路径不会重置 @modal slot，模态状态残留。",
    solution:
      "用 useRouter：history.length > 1 时 back()（回退会一并还原并行路由 slot），否则 push 兜底。",
    code: `const router = useRouter();

function close() {
  if (window.history.length > 1) router.back();
  else router.push("/gallery");
}`,
    lang: "ts",
  },

  // ────────────────────────── 渲染与缓存 ──────────────────────────
  {
    id: "uncached-data-during-prerender",
    title: "Next.js encountered uncached data during prerendering",
    category: "渲染与缓存",
    symptom:
      "Blocking Route / 页面报 uncached data during prerendering，且会一个接一个冒出来",
    cause:
      "开启 cacheComponents 后，(app) 段默认预渲染。若在组件顶层直接 await prisma.xxx / auth() / cookies() / headers()，预渲染期拿不到请求上下文也没法缓存，就报错。",
    solution:
      "A) 把取数抽成异步子组件并用 `<Suspense>` 包住（保留流式渲染，推荐）；B) `export const dynamic = \"force-dynamic\"`（元数据路由、纯动态页）。务必全局 grep 一次补齐，否则会逐页报错。",
    code: `// A) 流式方案
async function GalleryGrid() {
  const items = await prisma.product.findMany();
  return <List items={items} />;
}

export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <GalleryGrid />
    </Suspense>
  );
}`,
    lang: "tsx",
  },
  {
    id: "revalidate-conflicts-cache-components",
    title: "Route segment config revalidate is not compatible with cacheComponents",
    category: "渲染与缓存",
    symptom: "配了 export const revalidate = 60 后构建直接失败",
    cause: "cacheComponents 开启时，路由段/路由处理器的 revalidate 段配置与新缓存模型冲突。",
    solution:
      "二选一：关掉 cacheComponents 恢复经典 revalidate；或删除段配置，改在组件/GET 内用 `use cache` + cacheLife()。注意 Next 16 下 Route Handler 的 GET 默认不缓存，要缓存必须显式 use cache。",
    code: `// cacheComponents 关闭时（经典）
export const revalidate = 60;

// cacheComponents 开启时
async function PostContent({ slug }: { slug: string }) {
  "use cache";
  cacheLife("minutes");
  return <Post slug={slug} />;
}`,
    lang: "ts",
  },
  {
    id: "revalidate-tag-two-args",
    title: "revalidateTag 报 Expected 2 arguments, but got 1",
    category: "渲染与缓存",
    symptom: "TS2554: Expected 2 arguments, but got 1",
    cause:
      "本版本签名变为 revalidateTag(tag, profile)，第二参 profile 变成必填，接受 cacheLife 档位名或 { expire } 对象。revalidatePath 的第二参仍可选，不受影响。",
    solution: "补上 profile 参数。语义是「失效后该 tag 的缓存寿命」，按需给即可。",
    code: `import { revalidateTag } from "next/cache";

// 30 秒后过期（与 fetch 的 revalidate: 30 对齐）
revalidateTag("gh-zen", { expire: 30 });

// 也可以直接给档位名
revalidateTag("gh-zen", "max");`,
    lang: "ts",
  },
  {
    id: "fetch-not-cached-by-default",
    title: "fetch 默认不缓存了，重复请求一直打到源站",
    category: "渲染与缓存",
    symptom: "调试时发现 fetch 每次都真实请求，revalidate 没生效",
    cause: "Next 15 起 fetch 与 GET Route Handler 默认不再缓存，必须显式声明。",
    solution: "显式声明缓存策略，并用 tag 标记以便主动失效。",
    code: `// 缓存 30 秒 + 打标签，可被 revalidateTag 主动失效
const res = await fetch(url, {
  next: { revalidate: 30, tags: ["gh-zen"] },
});

// 明确不缓存
const res = await fetch(url, { cache: "no-store" });`,
    lang: "ts",
  },
  {
    id: "draft-mode-forces-dynamic",
    title: "接入 Draft Mode 后，原本 SSG 的页面全变动态了",
    category: "渲染与缓存",
    symptom: "加了 draftMode() 之后 generateStaticParams / ISR 好像不起作用了",
    cause:
      "draftMode() 和 cookies()/headers() 一样是动态 API，读取它的页面会退化为按请求动态渲染。这是设计使然，不是 bug。",
    solution:
      "把草稿预览隔离到独立的动态路由（如 /demo/draft），不要在主站静态列表页里读 draftMode，让主站保持静态生成。",
    code: `// 主站 /blog：保持静态，只列已发布
// 预览 /demo/draft：读 draftMode()，未开启时对未发布内容 notFound()
const { isEnabled } = await draftMode();
if (!isEnabled && !post.published) notFound();`,
    lang: "ts",
  },

  // ───────────────────────────── 数据层 ─────────────────────────────
  {
    id: "seed-upsert-missing-field",
    title: "seed 脚本 upsert 的 update 漏字段，重跑也修不好数据",
    category: "数据层",
    symptom: "改了 seed 数据源但数据库没变；重跑 seed 依然是旧值",
    cause:
      "upsert 的 create 写对了，但 update 分支字段不全/写死。比如 update 里硬编码 published: true，草稿就永远改不成未发布。",
    solution: "update 分支跟着数据源走，不要写死常量。重跑 seed 即可修正。",
    code: `await prisma.post.upsert({
  where: { slug: p.slug },
  update: {
    published: p.published,   // ✅ 取自数据源，而非写死 true
    title: p.title,
  },
  create: p,
});`,
    lang: "js",
  },
  {
    id: "prisma-8-rc-generate",
    title: "Prisma 8 RC 报 No command registered for generate",
    category: "数据层",
    symptom: "pnpm prisma generate → No command registered for generate",
    cause: "装了 Prisma 8 的 RC/预览版，CLI 与 client 包拆分了，命令注册方式不同。",
    solution: "回到稳定的 6.x：npm i -D prisma@6 && npm i @prisma/client@6，然后重新 generate。",
    code: `// package.json
"devDependencies": { "prisma": "^6.19.3" },
"dependencies":     { "@prisma/client": "^6.19.3" }

# 然后
pnpm prisma generate`,
    lang: "json",
  },

  // ─────────────────────────── React Hooks ───────────────────────────
  {
    id: "use-optimistic-missing-reducer",
    title: "useOptimistic 报 optimisticItems.map is not a function",
    category: "React Hooks",
    symptom: "加入购物车后崩溃：xxx.map is not a function",
    cause:
      "React 19 的 useOptimistic(initial) 只传初始值、漏了第二个 reducer。缺 reducer 时 addOptimistic(value) 会用 value 整体替换状态，数组变成单个对象。",
    solution: "补上 reducer。",
    code: `// ❌ 少了 reducer
const [items, addOptimistic] = useOptimistic(initialItems);

// ✅ reducer 追加
const [items, addOptimistic] = useOptimistic<Item[], Item>(
  initialItems,
  (state, newItem) => [...state, newItem],
);`,
    lang: "tsx",
  },
  {
    id: "use-optimistic-generic",
    title: "useOptimistic 报「应有 1 个参数，但获得 2 个」",
    category: "React Hooks",
    symptom: "TS 报错：Expected 1 arguments, but got 2",
    cause:
      "只显式写了 1 个类型参数，TS 匹配到了单参重载。需要同时指定 State 和 Action 两个类型参数才能走双参重载。",
    solution: "写全两个类型参数。",
    code: `useOptimistic<Item[], Item>(initialItems, reducer);
//     ↑ State      ↑ Action`,
    lang: "tsx",
  },
  {
    id: "set-state-in-effect",
    title: "useEffect 里 setState 被 lint 拦下（React 19 新规则）",
    category: "React Hooks",
    symptom:
      "error: Calling setState synchronously within an effect can trigger cascading renders（react-hooks/set-state-in-effect）",
    cause:
      "新版 react-hooks 规则禁止在 effect 里同步 setState，经典的 `useEffect(() => setMounted(true), [])` 挂载标记写法不再通过。",
    solution:
      "改用 useSyncExternalStore：getServerSnapshot 返回 false 保证 SSR 与首次客户端渲染一致，还省一次渲染。若状态源本就是外部系统（DOM 属性、store），直接订阅它更干净。",
    code: `const noopSubscribe = () => () => {};

export function useIsHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,    // 客户端快照
    () => false,   // 服务端快照
  );
}`,
    lang: "ts",
  },

  // ────────────────────────── 样式与主题 ──────────────────────────
  {
    id: "tailwind4-dark-variant",
    title: "Tailwind 4 里 dark: 前缀静默失效",
    category: "样式与主题",
    symptom: "不报任何错，但 dark: 样式完全没效果",
    cause:
      "Tailwind 4 默认 dark 变体跟随系统媒体查询，而 next-themes 是用 .dark 类挂在 <html> 上，两者对不上，且不会报错。",
    solution: "用 @custom-variant 把 dark 变体显式绑定到 .dark 类。",
    code: `@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));`,
    lang: "css",
  },
  {
    id: "theme-fouc",
    title: "主题切换后刷新会闪一下默认配色",
    category: "样式与主题",
    symptom: "刷新页面瞬间先闪一下白/黑再跳到目标主题（FOUC）",
    cause:
      "服务端渲染时不知道用户主题。CSS 加载后先按默认色绘制，等 JS 跑完才改成真实主题。",
    solution:
      "在根布局 <head> 放同步内联脚本，在首屏绘制前就把属性写到 <html> 上。next-themes 自带这套脚本处理明暗轴，自定义轴需自己写。",
    code: `const PALETTE_SCRIPT = \`try{var p=localStorage.getItem('palette');
if(p)document.documentElement.setAttribute('data-palette',p);}catch(e){}\`;

// <html> 还要加 suppressHydrationWarning
<html suppressHydrationWarning>`,
    lang: "tsx",
  },

  // ────────────────────────── TypeScript ──────────────────────────
  {
    id: "form-action-must-void",
    title: "Server Action 传给 <form action> 报 TS2322",
    category: "TypeScript",
    symptom:
      "Type '(formData: FormData) => Promise<{error: string}|undefined>' is not assignable to '(formData: FormData) => void | Promise<void>'",
    cause: "作为 form action 的函数必须返回 void，返回值不会传递给调用方。",
    solution:
      "把返回类型改成 Promise<void>，需要回传错误就 redirect 到带查询串的地址，由页面读取 searchParams 展示。",
    code: `// 之前：返回 error 对象 → TS2322
export async function loginAction(formData: FormData) {
  return { error: "登录失败" };
}

// 之后：void + redirect
export async function loginAction(formData: FormData): Promise<void> {
  try {
    await signIn("credentials", { /* ... */ });
  } catch (error) {
    if (error instanceof AuthError) redirect("/login?error=1");
    throw error;
  }
}`,
    lang: "ts",
  },
  {
    id: "type-guard-narrowing",
    title: "类型守卫收窄不了 undefined，TS2322",
    category: "TypeScript",
    symptom: "Type 'string | undefined' is not assignable to type '\"zh\" | \"en\"'",
    cause: "守卫参数写成了 string，无法对 `string | undefined` 生效，条件为真时 TS 不知道值已非空。",
    solution: "守卫参数放宽为 unknown，条件用独立变量承接。",
    code: `// ❌ 收窄不了 undefined
function isLocale(v: string): v is Locale { ... }

// ✅
function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value);
}

const hasCookie = isLocale(cookieValue);          // 赋给独立变量
const locale = hasCookie ? cookieValue : "zh";    // 此时已收窄为 Locale`,
    lang: "ts",
  },
];

export const categoriesWithCount = categories.map((c) => ({
  name: c,
  count: pitfalls.filter((p) => p.category === c).length,
}));

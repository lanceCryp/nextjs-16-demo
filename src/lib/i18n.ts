// 极简 i18n：**Cookie 协商方案** —— 语言存 cookie，URL 不出现语言前缀。
// Next 官方三种 i18n 路由策略：Sub-path（/zh/about）、Domain（zh.域名/about）、Cookie（本方案）。
// 完整说明见 https://nextjs.org/docs/app/guides/internationalization/routing-strategies
//
// 流程：
//   1) proxy.ts 读 cookie；没有则按 Accept-Language 请求头探测，写入 cookie 并放行（URL 不变）
//   2) 页面读 cookie（首次访问读不到，回退读 proxy 注入的 x-locale 请求头）渲染对应字典
//   3) 用户切语言 = Server Action 写 cookie + redirect 回原路径，URL 始终不变
//
// 优点：URL 干净、链接无需带语言前缀、对 SEO 友好的程度取决于是否给 hreflang。
// 代价：语言状态在 cookie 里 → 页面必须动态渲染（读 cookies()），无法静态预渲染。

export const locales = ["zh", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh";

// 语言偏好 cookie 名
export const LOCALE_COOKIE = "locale";

type Dict = {
  title: string;
  desc: string;
  greeting: string;
  current: string;
  hint: string;
  switchTo: string;
  source: string;
};

const dictionaries: Record<Locale, Dict> = {
  zh: {
    title: "国际化演示（Cookie 协商）",
    desc: "语言偏好存在 cookie 里，URL 不带任何语言前缀",
    greeting: "你好，世界",
    current: "当前语言：中文",
    hint: "切语言只改写 cookie 并软跳转回当前路径，地址栏始终是 /demo/i18n。换一台设备或清掉 cookie，会按浏览器 Accept-Language 重新协商。",
    switchTo: "切换语言",
    source: "语言来源",
  },
  en: {
    title: "i18n Demo (Cookie-based)",
    desc: "Language preference lives in a cookie — no language prefix in the URL",
    greeting: "Hello, World",
    current: "Current locale: English",
    hint: "Switching locale only rewrites the cookie and redirects back to the same path — the address bar stays at /demo/i18n. On a new device or after clearing cookies, the browser's Accept-Language header decides.",
    switchTo: "Switch language",
    source: "Locale source",
  },
};

export const localeNames: Record<Locale, string> = {
  zh: "中文",
  en: "English",
};

// 类型守卫：只认白名单里的语言，非法值（含 undefined）一律判为 false
export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

// 容错解析：cookie / 请求头里取到的值 → 合法 Locale
export function resolveLocale(value?: string | null): Locale {
  return isLocale(value) ? value : defaultLocale;
}

// 解析 Accept-Language 请求头，如 "zh-CN,zh;q=0.9,en;q=0.8" → "zh"
// 按 q 值降序匹配，支持 zh-CN 这类带子标签回退到基础标签 zh
export function detectLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.split("=")[1]) : 1;
      return { tag: (tag ?? "").trim().toLowerCase(), q: Number.isFinite(q) ? q : 0 };
    })
    .filter((e) => e.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (isLocale(tag)) return tag;
    const base = tag.split("-")[0];
    if (base && isLocale(base)) return base;
  }

  return defaultLocale;
}

export function getDictionary(lang: Locale): Dict {
  return dictionaries[lang];
}

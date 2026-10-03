import { cookies, headers } from "next/headers";
import type { Metadata } from "next";
import {
  LOCALE_COOKIE,
  getDictionary,
  localeNames,
  locales,
  resolveLocale,
} from "@/lib/i18n";
import { switchLocaleAction } from "./actions";

export const metadata: Metadata = {
  title: "国际化 | Next.js 演示",
  description: "Cookie 协商式 i18n：语言存 cookie，URL 不带语言前缀",
};

export default async function I18nDemoPage() {
  // 语言来源优先级：cookie（用户显式切换过）> x-locale 请求头（proxy 按 Accept-Language 协商）
  // 注意：读 cookies() 会让本页走动态渲染 —— 这是 Cookie 方案的固有代价。
  const store = await cookies();
  const fromCookie = store.get(LOCALE_COOKIE)?.value;
  const fromHeader = (await headers()).get("x-locale");

  const source = fromCookie
    ? "cookie（用户显式选择）"
    : "Accept-Language（浏览器协商）";
  const lang = resolveLocale(fromCookie ?? fromHeader);
  const t = getDictionary(lang);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t.title}</h1>
      <p className="text-gray-600">{t.desc}</p>
      <p className="text-lg">{t.greeting}</p>
      <p className="text-sm text-gray-500">{t.current}</p>

      <form action={switchLocaleAction} className="flex items-center gap-2">
        <input type="hidden" name="back" value="/demo/i18n" />
        <span className="text-sm text-gray-500">{t.switchTo}：</span>
        {locales.map((l) => (
          <button
            key={l}
            type="submit"
            name="locale"
            value={l}
            className={
              l === lang
                ? "rounded bg-black px-3 py-1 text-white"
                : "rounded border px-3 py-1"
            }
          >
            {localeNames[l]}
          </button>
        ))}
      </form>

      <div className="space-y-1 text-sm text-gray-500">
        <p>
          {t.source}：<code>{source}</code>
        </p>
        <p>{t.hint}</p>
        <p className="text-xs text-gray-400">
          提示：在浏览器开发者工具 → Application → Cookies 里删掉 <code>locale</code>，
          刷新后会按浏览器的 Accept-Language 重新协商语言。
        </p>
      </div>
    </div>
  );
}

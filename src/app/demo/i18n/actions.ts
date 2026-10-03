"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LOCALE_COOKIE, isLocale, type Locale } from "@/lib/i18n";

// 切换语言 = 写 locale cookie + redirect 回原路径。
// URL 完全不变，这是「Cookie 协商方案」与「[lang] 子路径方案」最直观的差别。
// 必须走 redirect（而非 router.refresh）——本次请求已渲染完，
// 让浏览器带着新 cookie 重新请求，才能拿到正确语言的服务端渲染结果。
export async function switchLocaleAction(formData: FormData) {
  const next = formData.get("locale");
  const back = formData.get("back");

  const locale: Locale =
    typeof next === "string" && isLocale(next) ? next : "zh";

  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // 防开放重定向：只接受站内绝对路径
  const target =
    typeof back === "string" && back.startsWith("/") && !back.startsWith("//")
      ? back
      : "/demo/i18n";

  redirect(target);
}

import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import {
  LOCALE_COOKIE,
  detectLocale,
  isLocale,
  type Locale,
} from "@/lib/i18n";

// Next.js 16 起 middleware 改名为 proxy（默认 Node.js 运行时）。
// 本文件不导入 @/auth / Prisma：JWT 会话策略下 getToken 仅解码 cookie、不连库，最轻量。
//
// 职责一：登录保护（/dashboard、/cart 需要会话）
// 职责二：i18n 语言协商 —— 语言存 cookie，URL 不带前缀（Cookie 协商方案）
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 职责一：登录保护
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/cart");

  if (isProtected) {
    // 只在受保护路由上解码 JWT，避免每个请求都做无谓的解密开销
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 职责二：语言协商（Cookie 方案）
  // 已有 cookie 就沿用；没有则按 Accept-Language 探测，写入 cookie 并放行。
  // URL 始终不变 —— 语言前缀不出现在地址栏。
  const cookieValue = req.cookies.get(LOCALE_COOKIE)?.value;
  const hasValidCookie = isLocale(cookieValue);
  const locale: Locale = hasValidCookie
    ? cookieValue
    : detectLocale(req.headers.get("accept-language"));

  // 把本次协商结果注入请求头，让页面在「本次请求刚写 cookie、还读不到」的首访场景
  // 也能拿到正确语言（页面优先读 cookie，读不到再回退这个头）。
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-locale", locale);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // 仅在 cookie 缺失/非法时写入：已存在就不重复 set，保持响应可复用
  if (!hasValidCookie) {
    res.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  // 覆盖全部页面路由（语言协商需要），但排除 API、_next 内部资源与带扩展名的静态文件
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\..*).*)",
  ],
};

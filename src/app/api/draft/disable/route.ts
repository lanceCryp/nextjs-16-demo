import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// 关闭草稿模式：清除 __prerender_bypass cookie，请求重新走静态缓存。
// 访问方式：GET /api/draft/disable?to=/demo/draft
export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();

  const to = new URL(request.url).searchParams.get("to") ?? "/demo/draft";
  const safe = to.startsWith("/") && !to.startsWith("//") ? to : "/demo/draft";

  redirect(safe);
}

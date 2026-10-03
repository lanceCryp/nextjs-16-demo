import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// 开启草稿模式：写入 __prerender_bypass cookie。
// 该 cookie 会让 Next 绕过静态缓存（Full Route Cache），按请求重新渲染页面，
// 于是页面里就能读到「未发布」的内容 —— 这正是 CMS 预览未发布草稿的标准做法。
//
// 访问方式：GET /api/draft/enable?to=/demo/draft
// 之后访问任何页面都会带上草稿 cookie，直到调用 /api/draft/disable。
export async function GET(request: Request) {
  const draft = await draftMode();
  draft.enable();

  const to = new URL(request.url).searchParams.get("to") ?? "/demo/draft";
  // 简单防开放重定向：只接受站内绝对路径
  const safe = to.startsWith("/") && !to.startsWith("//") ? to : "/demo/draft";

  redirect(safe);
}

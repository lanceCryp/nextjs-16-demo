// 草稿模式提示条：仅在 draftMode().isEnabled 时渲染。
// 退出链接用普通 <a> 而非 <Link>：Route Handler 需要整页跳转来清除 cookie。
export function DraftBanner({ to = "/demo/draft" }: { to?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <span>草稿模式已开启：当前请求已绕过静态缓存，可预览未发布内容</span>
      <a
        href={`/api/draft/disable?to=${encodeURIComponent(to)}`}
        className="underline"
      >
        退出草稿模式
      </a>
    </div>
  );
}

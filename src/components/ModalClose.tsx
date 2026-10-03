"use client";

import { useRouter } from "next/navigation";

// 拦截路由模态的关闭按钮。
// 关键：用 router.back() 而非 <Link href="/gallery">。
// 原因：模态打开时 children slot 仍是 /gallery（画廊显示在底下），
// 单纯软导航到 /gallery 不会刷新 @modal slot，导致模态残留；
// router.back() 回退会还原上一帧的并行路由 slot（@modal 变回 default.tsx = null），可靠关闭。
export default function ModalClose() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/gallery");
      }}
      className="text-sm text-gray-500 hover:underline"
    >
      关闭
    </button>
  );
}

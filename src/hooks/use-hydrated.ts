"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * 是否已完成 hydration：服务端渲染与首次客户端渲染返回 false，挂载完成后为 true。
 *
 * 用 useSyncExternalStore 而非 `useEffect(() => setMounted(true), [])`：
 * 后者在新版 react-hooks 规则下会直接报 set-state-in-effect 错误，
 * 且会多触发一次渲染。getServerSnapshot 返回 false 还能保证服务端与
 * 首次客户端渲染结果一致，避免 hydration mismatch。
 */
export function useIsHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

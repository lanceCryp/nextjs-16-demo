// 演示用"第三方脚本"：通过 next/script 以 afterInteractive 策略注入。
// 真实项目里这里通常是 GA / 埋点 SDK；这里仅打印一条日志，证明脚本被正确加载。
(function () {
  try {
    // 延迟执行，避免阻塞首屏
    window.addEventListener("load", function () {
      console.log("[demo-analytics] next/script 注入的第三方脚本已加载", {
        path: location.pathname,
        ts: Date.now(),
      });
    });
  } catch (e) {
    console.warn("[demo-analytics] 执行失败", e);
  }
})();

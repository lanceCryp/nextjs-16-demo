"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh">
      <body className="p-6">
        <h2 className="text-xl font-bold">全局错误</h2>
        <p className="text-gray-600">{error.message}</p>
        <button onClick={reset} className="border rounded p-2 mt-2">
          重试
        </button>
      </body>
    </html>
  );
}

"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold">出错了</h2>
      <p className="text-gray-600">{error.message}</p>
      <button onClick={reset} className="border rounded p-2 mt-2">
        重试
      </button>
    </div>
  );
}

"use client";

import { useActionState, useOptimistic, useRef } from "react";
import { addToCart } from "./actions";

type Item = { id: string; title: string };

export function CartClient({
  products,
  initial = [],
}: {
  products: { id: string; title: string }[];
  initial?: Item[];
}) {
  const [optimisticItems, addOptimistic] = useOptimistic<Item[], Item>(
    initial,
    (state, newItem) => [...state, newItem],
  );
  const [state, formAction, pending] = useActionState(addToCart, {
    ok: false,
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const id = String(formData.get("productId") ?? "");
    const title = products.find((p) => p.id === id)?.title ?? "商品";
    // 乐观更新：先立即显示，再等服务端确认
    addOptimistic({ id: crypto.randomUUID(), title: `${title}（添加中…）` });
    formRef.current?.reset();
    await formAction(formData);
  }

  return (
    <div className="space-y-3">
      <form action={handleSubmit} ref={formRef} className="flex gap-2">
        <select name="productId" className="border rounded p-2" defaultValue={products[0]?.id}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending}
          className="border rounded p-2 bg-black text-white"
        >
          {pending ? "处理中…" : "加入购物车"}
        </button>
      </form>

      <ul className="space-y-1">
        {optimisticItems.map((it) => (
          <li key={it.id} className="border rounded p-2">
            {it.title}
          </li>
        ))}
      </ul>

      {state.message && <p className="text-sm text-gray-600">{state.message}</p>}
    </div>
  );
}

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CartClient } from "./cart-client";

// 用到 auth()（间接读取 cookies）→ 在 Cache Components 下必须显式声明动态，避免进缓存组件
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user
    .findUnique({ where: { email: session.user.email }, select: { id: true } })
    .catch(() => null);

  const [products, items] = await Promise.all([
    prisma.product.findMany({ select: { id: true, title: true } }).catch(() => []),
    user
      ? prisma.cartItem
          .findMany({
            where: { userId: user.id },
            include: { product: { select: { title: true } } },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  const initial = items.map((i) => ({
    id: i.id,
    title: `${i.product.title} x${i.quantity}`,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">购物车（Server Action + useOptimistic）</h1>
      <CartClient products={products} initial={initial} />
    </div>
  );
}

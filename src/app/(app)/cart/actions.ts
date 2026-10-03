"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { after } from "next/server";
import { log } from "@/lib/logger";

const schema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

export async function addToCart(
  _prev: { ok: boolean; message: string },
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.email) return { ok: false, message: "请先登录" };

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    quantity: Number(formData.get("quantity") ?? 1),
  });
  if (!parsed.success) return { ok: false, message: "参数错误" };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return { ok: false, message: "用户不存在" };

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: { quantity: { increment: parsed.data.quantity } },
    create: {
      userId: user.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    },
  });

  after(() => log("info", "cart updated", { user: user.id, product: parsed.data.productId }));
  revalidatePath("/cart");
  return { ok: true, message: "已加入购物车" };
}

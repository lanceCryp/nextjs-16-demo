"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

// 作为 <form action> 使用的 Server Action 必须返回 void（Promise<void>）。
// 登录失败时通过 redirect 回到登录页并携带错误标记，由页面展示提示文案。
export async function loginAction(formData: FormData): Promise<void> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    // signIn 成功时会抛出 NEXT_REDIRECT，需原样抛出
    throw error;
  }
}

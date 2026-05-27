"use server";

import { signIn, signOut } from "@/lib/auth";
import { checkRateLimit } from "../rate-limit";
import prisma from "../db";
import { AdminUser } from "@prisma/client";
import { redirect } from "next/navigation";

type LoginResult = { success: true } | { success: false; error: string };

export async function login(username: string, password: string): Promise<LoginResult> {
  const rateLimitResult = await checkRateLimit(`login:${username}`);

  if (!rateLimitResult.success) {
    return { success: false, error: "RATE_LIMIT_EXCEEDED" };
  }

  const user: AdminUser | null = await prisma.adminUser.findUnique({
    where: { username },
  });

  if (user && user.lockedUntil && user.lockedUntil > new Date()) {
    const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / (1000 * 60));
    return { success: false, error: `ACCOUNT_LOCKED:${remainingMinutes}` };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    // ✅ รีเซ็ตเฉพาะเมื่อ login สำเร็จ
    if (user && user.failedAttempts > 0) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { failedAttempts: 0, lockedUntil: null },
      });
    }
  } catch (error) {
    if (user) {
      const newFailedAttempts = user.failedAttempts + 1;
      const MAX_FAILED_ATTEMPTS = 5;
      const LOCKOUT_DURATION_MINUTES = 15;

      if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: {
            failedAttempts: newFailedAttempts,
            lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000),
          },
        });
        return { success: false, error: `ACCOUNT_LOCKED:${LOCKOUT_DURATION_MINUTES}` };
      } else {
        await prisma.adminUser.update({
          where: { id: user.id },
          data: { failedAttempts: newFailedAttempts },
        });
      }
    }
    return { success: false, error: "INVALID_CREDENTIALS" };
  }

  // redirect ต้องอยู่นอก try/catch เสมอ
  redirect("/admin/dashboard");
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/admin/login" });
}

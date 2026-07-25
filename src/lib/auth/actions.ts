"use server";

import { redirect } from "next/navigation";
import { createAdminSession, deleteAdminSession } from "./session";

export interface LoginState {
  error?: string;
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "ADMIN_PASSWORD is not configured on the server." };
  }
  if (typeof password !== "string" || password !== adminPassword) {
    return { error: "Incorrect password." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function logout() {
  await deleteAdminSession();
  redirect("/admin/login");
}

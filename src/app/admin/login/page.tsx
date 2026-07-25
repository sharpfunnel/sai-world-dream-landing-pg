"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/auth/actions";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-white/10 bg-neutral-900 p-8 shadow-xl"
      >
        <h1 className="text-lg font-semibold text-white">Admin sign in</h1>
        <p className="mt-1 text-sm text-neutral-400">Sai World Dreams analytics dashboard</p>

        <label htmlFor="password" className="mt-6 block text-xs font-medium uppercase tracking-wide text-neutral-400">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          className="mt-2 w-full rounded-md border border-white/10 bg-neutral-800 px-3 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500"
        />

        {state?.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

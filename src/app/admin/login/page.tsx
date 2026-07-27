"use client";

import { useActionState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { login, type LoginState } from "@/lib/auth/actions";
import { SITE, STOCK_IMAGES } from "@/data/project";
import { unsplashUrl } from "@/lib/utils";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-12">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={unsplashUrl(STOCK_IMAGES.skylineDusk, { w: 2000 })}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-navy-950/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/40 via-navy-950/60 to-navy-950" />

      <form
        action={formAction}
        className="relative w-full max-w-sm rounded-lg border border-white/10 bg-navy-900/50 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
      >
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/30 bg-gold-400/10">
            <ShieldCheck className="h-5 w-5 text-gold-300" strokeWidth={1.75} />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-300/90">
            {SITE.brandLine}
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white">Admin sign in</h1>
          <p className="mt-1 text-sm text-white/50">Analytics &amp; campaign dashboard</p>
        </div>

        <label
          htmlFor="password"
          className="mt-7 block text-xs font-medium uppercase tracking-wide text-white/50"
        >
          Password
        </label>
        <div className="relative mt-2">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            className="w-full rounded-md border border-white/10 bg-navy-950/60 py-2.5 pl-10 pr-3 text-sm text-white outline-none transition-colors focus:border-gold-300/50 focus:ring-2 focus:ring-gold-300/30"
          />
        </div>

        {state?.error && <p className="mt-3 text-sm text-red-400">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 w-full rounded-md bg-gold-400 px-4 py-2.5 text-sm font-semibold text-navy-950 shadow-md shadow-gold-900/10 transition-colors hover:bg-gold-500 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

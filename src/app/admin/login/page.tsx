"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-4">
      <div className="a-card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand text-white">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path d="M20 2 8 9v10l12 7 12-7V9L20 2z" fill="#fff" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
            Yubi Admin
          </h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage your website</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="a-field">
            <label className="a-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              className="a-input"
              placeholder="Enter admin password"
            />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button type="submit" disabled={pending} className="a-btn a-btn-primary w-full justify-center">
            {pending ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

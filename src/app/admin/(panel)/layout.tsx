import Link from "next/link";
import AdminNav from "@/components/admin/AdminNav";
import { isFirebaseConfigured } from "@/lib/firebase-admin";
import { logout } from "../actions";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  return (
    <div className="flex min-h-screen bg-[#f4f5f7]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink p-5 lg:flex">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand text-white">
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path d="M20 2 8 9v10l12 7 12-7V9L20 2z" fill="#fff" />
            </svg>
          </div>
          <span className="font-bold text-white" style={{ fontFamily: "var(--font-poppins)" }}>
            Yubi Admin
          </span>
        </div>
        <AdminNav />
        <div className="mt-auto space-y-2 border-t border-white/10 pt-4">
          <Link
            href="/"
            target="_blank"
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
          >
            ↗ View live site
          </Link>
          <form action={logout}>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 hover:text-white">
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        {/* mobile top bar */}
        <div className="flex items-center justify-between bg-ink px-4 py-3 lg:hidden">
          <span className="font-bold text-white" style={{ fontFamily: "var(--font-poppins)" }}>
            Yubi Admin
          </span>
          <form action={logout}>
            <button className="text-sm text-gray-300">Log out</button>
          </form>
        </div>
        <div className="lg:hidden">
          <div className="border-b bg-ink px-3 pb-3">
            <AdminNav />
          </div>
        </div>

        {!configured && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-3 text-sm text-amber-800">
            <strong>Firebase not connected.</strong> You&apos;re viewing the built-in default
            content. Add your <code>FIREBASE_*</code> values to <code>.env.local</code> and restart
            to enable saving &amp; uploads. See the README.
          </div>
        )}

        <main className="mx-auto max-w-4xl p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}

import { isFirebaseConfigured } from "@/lib/firebase-admin";
import { getQuotes, isEmailConfigured, type QuoteStatus } from "@/lib/quote";
import { deleteQuoteAction, forwardQuoteAction } from "../../actions";

const BADGE: Record<QuoteStatus, { label: string; cls: string }> = {
  clean: { label: "Genuine", cls: "bg-green-50 text-green-700 border-green-200" },
  flagged: { label: "Possible spam", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  blocked: { label: "Blocked", cls: "bg-red-50 text-red-700 border-red-200" },
};

const FILTERS: { key: "all" | QuoteStatus; label: string }[] = [
  { key: "all", label: "All" },
  { key: "clean", label: "Genuine" },
  { key: "flagged", label: "Possible spam" },
  { key: "blocked", label: "Blocked" },
];

export default async function QuotesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; forwarded?: string; deleted?: string; error?: string }>;
}) {
  const [quotes, sp] = await Promise.all([getQuotes(), searchParams]);
  const show = FILTERS.some((f) => f.key === sp.show) ? (sp.show as "all" | QuoteStatus) : "all";
  const list = show === "all" ? quotes : quotes.filter((q) => q.status === show);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Quote Requests
      </h1>
      <p className="mt-1 text-muted">
        Every enquiry from the website form, including ones the spam check held back. Set who receives
        them under Company &amp; Contact.
      </p>

      {!isFirebaseConfigured() && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Firebase isn&apos;t connected yet, so requests are only emailed, not saved here.
        </p>
      )}
      {!isEmailConfigured() && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Email isn&apos;t set up yet — add SMTP_USER and SMTP_PASS to your environment settings.
        </p>
      )}
      {sp.forwarded && (
        <p className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Request emailed to all recipients.
        </p>
      )}
      {sp.deleted && (
        <p className="mt-6 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          ✓ Request deleted.
        </p>
      )}
      {sp.error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Couldn&apos;t send the email. Check the email settings and try again.
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.key === "all" ? quotes.length : quotes.filter((q) => q.status === f.key).length;
          return (
            <a
              key={f.key}
              href={f.key === "all" ? "/admin/quotes" : `/admin/quotes?show=${f.key}`}
              className={`a-btn ${show === f.key ? "a-btn-primary" : "a-btn-ghost"}`}
            >
              {f.label} ({count})
            </a>
          );
        })}
      </div>

      <div className="mt-6 space-y-4">
        {list.length === 0 && <div className="a-card p-6 text-sm text-muted">No requests yet.</div>}
        {list.map((q) => (
          <div key={q.id} className="a-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-ink">{q.name}</h2>
                  <span className={`rounded border px-2 py-0.5 text-xs font-medium ${BADGE[q.status].cls}`}>
                    {BADGE[q.status].label}
                  </span>
                  {!q.emailed && q.status !== "blocked" && (
                    <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      Email failed
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {new Date(q.createdAt).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} ·{" "}
                  {q.service || "No service selected"}
                </p>
              </div>
              <div className="flex gap-2">
                {q.status !== "clean" && (
                  <form action={forwardQuoteAction}>
                    <input type="hidden" name="id" value={q.id} />
                    <button className="a-btn a-btn-ghost">Not spam — email it</button>
                  </form>
                )}
                <form action={deleteQuoteAction}>
                  <input type="hidden" name="id" value={q.id} />
                  <button className="a-btn a-btn-danger">Delete</button>
                </form>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <a href={`mailto:${q.email}`} className="text-brand hover:underline">{q.email}</a>
              <a href={`tel:${q.phone.replace(/[^\d+]/g, "")}`} className="text-brand hover:underline">{q.phone}</a>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{q.message}</p>
            {q.reasons.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Spam score {q.score}: {q.reasons.join(" · ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

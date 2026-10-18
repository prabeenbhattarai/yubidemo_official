import Flash from "@/components/admin/Flash";
import JobsManager from "@/components/admin/JobsManager";
import { getJobs } from "@/lib/content";
import { getApplications } from "@/lib/careers";
import { isFirebaseConfigured } from "@/lib/firebase-admin";
import { deleteApplicationAction } from "../../actions";

export default async function CareersAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; job?: string }>;
}) {
  const [jobs, applications, sp] = await Promise.all([getJobs(), getApplications(), searchParams]);
  const counts: Record<string, number> = {};
  for (const a of applications) counts[a.jobId] = (counts[a.jobId] ?? 0) + 1;
  const list = sp.job ? applications.filter((a) => a.jobId === sp.job) : applications;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Careers
      </h1>
      <p className="mt-1 text-muted">
        Post jobs for the Careers page and review applications. Each application is also emailed to you with the CV
        attached. One application per person per job — matched on email or phone number.
      </p>

      {!isFirebaseConfigured() && (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Firebase isn&apos;t connected yet, so jobs can&apos;t be saved and applications are only emailed — the
          one-application-per-person check also needs Firebase.
        </p>
      )}

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <JobsManager jobs={jobs} counts={counts} />
      </div>

      <div id="applications" className="mt-12 scroll-mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
            Applications ({list.length})
          </h2>
          {jobs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <a href="/api/admin/yubidemo/careers#applications" className={`a-btn ${!sp.job ? "a-btn-primary" : "a-btn-ghost"}`}>
                All
              </a>
              {jobs.map((j) => (
                <a
                  key={j.id}
                  href={`/api/admin/yubidemo/careers?job=${j.id}#applications`}
                  className={`a-btn ${sp.job === j.id ? "a-btn-primary" : "a-btn-ghost"}`}
                >
                  {j.title} ({counts[j.id!] ?? 0})
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 space-y-4">
          {list.length === 0 && <div className="a-card p-6 text-sm text-muted">No applications yet.</div>}
          {list.map((a) => (
            <div key={a.id} className="a-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-ink">{a.name}</h3>
                  <p className="mt-0.5 text-sm text-muted">
                    {a.jobTitle} ·{" "}
                    {new Date(a.createdAt).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}
                    {!a.emailed && <span className="ml-2 font-medium text-red-600">· email failed</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  {a.cvPath && (
                    <a href={`/api/admin/cv/${a.id}`} className="a-btn a-btn-primary">
                      Download CV
                    </a>
                  )}
                  <form action={deleteApplicationAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="a-btn a-btn-danger">Delete</button>
                  </form>
                </div>
              </div>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["Email", <a key="e" href={`mailto:${a.email}`} className="text-brand hover:underline">{a.email}</a>],
                  ["Phone", <a key="p" href={`tel:${a.phone.replace(/[^\d+]/g, "")}`} className="text-brand hover:underline">{a.phone}</a>],
                  ["Suburb", a.suburb],
                  ["Work rights", a.workRights],
                  ["Experience", a.experience],
                  ["Licences", a.licences || "—"],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
                    <dd className="text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              {a.message && <p className="mt-4 whitespace-pre-wrap border-t border-gray-100 pt-3 text-sm text-ink">{a.message}</p>}
            </div>
          ))}
        </div>
        {applications.length > 0 && (
          <p className="mt-6 text-xs text-muted">
            Deleting an application also deletes its CV and lets that person apply for the job again. Delete
            applications you no longer need — CVs contain personal information.
          </p>
        )}
      </div>
    </div>
  );
}

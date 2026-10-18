import Flash from "@/components/admin/Flash";
import { getCompany } from "@/lib/content";
import { saveCompanyAction } from "../../actions";

export default async function CompanyAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [company, sp] = await Promise.all([getCompany(), searchParams]);

  const fields: { name: keyof typeof company; label: string; full?: boolean }[] = [
    { name: "name", label: "Company name" },
    { name: "legalName", label: "Legal name" },
    { name: "phone", label: "Phone (display)" },
    { name: "phoneHref", label: "Phone (dial, digits only)" },
    { name: "email", label: "Primary email" },
    { name: "supportEmail", label: "Support email" },
    { name: "website", label: "Website" },
    { name: "abn", label: "ABN" },
    { name: "address", label: "Full address", full: true },
    { name: "addressShort", label: "Short address (top bar)", full: true },
    { name: "tagline", label: "Tagline (top bar)", full: true },
    {
      name: "quoteRecipients",
      label: "Quote request emails (comma-separated — the first address also receives possible-spam requests)",
      full: true,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Company &amp; Contact
      </h1>
      <p className="mt-1 text-muted">These details appear in the top bar, footer and contact page.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} />
        <form action={saveCompanyAction} className="a-card grid gap-5 p-6 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.name} className={`a-field ${f.full ? "sm:col-span-2" : ""}`}>
              <label className="a-label">{f.label}</label>
              <input name={f.name} defaultValue={company[f.name]} className="a-input" placeholder={f.name === "quoteRecipients" ? "sydney@yubidemo.com.au, estimator@gmail.com" : undefined} />
            </div>
          ))}
          <div className="sm:col-span-2">
            <button className="a-btn a-btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

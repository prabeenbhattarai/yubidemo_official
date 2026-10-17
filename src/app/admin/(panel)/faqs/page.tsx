import Flash from "@/components/admin/Flash";
import FaqsManager from "@/components/admin/FaqsManager";
import { getFaqs } from "@/lib/content";

export default async function FaqsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [faqs, sp] = await Promise.all([getFaqs(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        FAQs
      </h1>
      <p className="mt-1 text-muted">Questions shown on the homepage and contact page.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <FaqsManager faqs={faqs} />
      </div>
    </div>
  );
}

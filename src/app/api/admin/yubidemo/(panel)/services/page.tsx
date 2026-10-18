import Flash from "@/components/admin/Flash";
import ServicesManager from "@/components/admin/ServicesManager";
import { getServices } from "@/lib/content";

export default async function ServicesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const [services, sp] = await Promise.all([getServices(), searchParams]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink" style={{ fontFamily: "var(--font-poppins)" }}>
        Services
      </h1>
      <p className="mt-1 text-muted">Add, edit, reorder or remove the services shown across the site.</p>

      <div className="mt-6">
        <Flash saved={sp.saved === "1"} deleted={sp.deleted === "1"} />
        <ServicesManager services={services} />
      </div>
    </div>
  );
}

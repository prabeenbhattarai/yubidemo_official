import Link from "next/link";

export default function PageBanner({
  title,
  crumb,
}: {
  title: string;
  crumb?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg,#14171c 0%,#22272e 60%,#2c333b 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 60px, rgba(255,255,255,.6) 60px 62px)",
        }}
      />
      {/* Top padding clears the fixed, transparent header that sits over the banner. */}
      <div className="container-x relative pb-20 pt-[calc(76px+5rem)] md:pb-28 lg:pt-[calc(120px+7rem)]">
        <h1 className="text-4xl font-bold md:text-5xl">{title}</h1>
        <nav className="mt-4 flex items-center gap-2 text-[14px] text-white/70">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="text-brand">/</span>
          <span>{crumb ?? title}</span>
        </nav>
      </div>
    </section>
  );
}

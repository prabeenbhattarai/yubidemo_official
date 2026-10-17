export default function SectionHeading({
  title,
  subtitle,
  center = false,
  light = false,
}: {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <h2
        className={`text-3xl font-bold sm:text-4xl md:text-[44px] md:leading-[1.1] ${
          light ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-lg ${light ? "text-white/70" : "text-muted"}`}>{subtitle}</p>
      )}
      <div className={`mt-6 flex items-center gap-1 ${center ? "justify-center" : ""}`}>
        <span className="h-1 w-16 bg-brand" />
        <span className="h-1 w-24 bg-gray-200" />
      </div>
    </div>
  );
}

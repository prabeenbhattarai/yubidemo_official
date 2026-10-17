import Link from "next/link";

const MOTION = "w-auto transition-[height,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * `nav` sizes the logo for the header: it fills most of the 76px bar (64px
 * once the bar floats) without making the bar any taller. In the header both
 * versions are stacked and cross-faded, so switching between the white logo
 * (over the hero) and the dark one (on the white bar) is smooth.
 */
export default function Logo({
  light = false,
  compact = false,
  nav = false,
}: {
  light?: boolean;
  compact?: boolean;
  nav?: boolean;
}) {
  const height = nav ? (compact ? "h-[50px]" : "h-[60px]") : compact ? "h-9" : "h-11";

  if (!nav) {
    return (
      <Link href="/" className="inline-flex shrink-0 items-center" aria-label="Yubi Demolition home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={light ? "/images/logo-white.png" : "/images/logo-dark.png"}
          alt="Yubi Demolition — Clear the Way with Yubi"
          width={350}
          height={100}
          className={`${MOTION} ${height}`}
        />
      </Link>
    );
  }

  return (
    <Link href="/" className="relative inline-flex shrink-0 items-center" aria-label="Yubi Demolition home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-dark.png"
        alt="Yubi Demolition — Clear the Way with Yubi"
        width={350}
        height={100}
        className={`${MOTION} ${height} ${light ? "opacity-0" : "opacity-100"}`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-white.png"
        alt=""
        aria-hidden
        width={350}
        height={100}
        className={`absolute left-0 top-1/2 -translate-y-1/2 ${MOTION} ${height} ${light ? "opacity-100" : "opacity-0"}`}
      />
    </Link>
  );
}

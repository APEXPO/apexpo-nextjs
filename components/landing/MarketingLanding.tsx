import CodeRain from "@/components/CodeRain";

type MarketingLandingProps = {
  /** When false, skip matrix (e.g. language picker provides its own fixed backdrop). */
  showCodeRain?: boolean;
};

/**
 * Lightweight marketing shell used as the blurred backdrop behind onboarding.
 * Keeps the route visually aligned with the main landing without pulling in nav/footer here.
 */
export default function MarketingLanding({
  showCodeRain = true,
}: MarketingLandingProps) {
  return (
    <div
      className={
        showCodeRain
          ? "relative min-h-screen overflow-hidden bg-[#020617] text-[#f0f9ff]"
          : "relative z-[1] min-h-screen overflow-hidden bg-transparent text-[#f0f9ff]"
      }
      style={{
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,211,238,0.12), transparent), radial-gradient(ellipse 60% 40% at 100% 50%, rgba(168,85,247,0.08), transparent)",
      }}
    >
      {showCodeRain ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <CodeRain opacity={0.65} />
        </div>
      ) : null}
      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-28 lg:px-10 lg:pt-36">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[#22d3ee]"
            aria-hidden
          />
          <span className="font-mono text-[11px] font-semibold tracking-widest text-[#22d3ee]">
            APEXPO
          </span>
        </div>
        <h1 className="mt-10 max-w-3xl font-sans text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[1.05] tracking-tight">
          Trade shows,{" "}
          <span className="bg-gradient-to-r from-[#22d3ee] to-[#a855f7] bg-clip-text text-transparent">
            reimagined
          </span>
          .
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#94a3b8]">
          Full-screen preview of your landing — scrollable behind the language
          overlay with blur and dimming applied by the picker layer.
        </p>
      </div>
    </div>
  );
}

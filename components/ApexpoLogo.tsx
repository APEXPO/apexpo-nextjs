import Image from "next/image";

type ApexpoLogoProps = {
  height?: number;
  className?: string;
};

/**
 * Brand wordmark — dark variant for deep backgrounds (#020617).
 * Aspect from source asset ~512×281.
 */
export default function ApexpoLogo({
  height = 36,
  className = "",
}: ApexpoLogoProps) {
  const width = Math.round(height * 1.82);
  return (
    <Image
      src="/apexpo-logo-dark.png"
      alt=""
      width={width}
      height={height}
      draggable={false}
      className={`block select-none ${className}`}
      priority
      aria-hidden
    />
  );
}

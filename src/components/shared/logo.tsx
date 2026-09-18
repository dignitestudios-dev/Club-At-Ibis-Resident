import Image from "next/image";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface LogoProps {
  variant?: "navy" | "ivory" | "blue" | "gold";
  showWordmark?: boolean;
  href?: string;
  size?: number;
  className?: string;
}

const MARKS: Record<NonNullable<LogoProps["variant"]>, string> = {
  navy: "/brand/ibis-mark-navy.png",
  ivory: "/brand/ibis-mark-ivory.png",
  blue: "/brand/ibis-mark-blue.png",
  gold: "/brand/ibis-mark-gold.png",
};

// Intrinsic aspect ratio of the source marks (640x421).
const MARK_ASPECT_RATIO = 640 / 421;

export function Logo({
  variant = "navy",
  showWordmark = true,
  href,
  size = 28,
  className,
}: LogoProps) {
  const wordmarkColor = variant === "ivory" ? "text-white" : "text-foreground";

  const content = (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src={MARKS[variant]}
        alt="Club At Ibis"
        width={Math.round(size * MARK_ASPECT_RATIO)}
        height={size}
        className="shrink-0 object-contain"
        priority
      />
      {showWordmark && (
        <span
          className={cn(
            "font-heading text-lg font-medium tracking-tight",
            wordmarkColor
          )}
        >
          Club At Ibis
        </span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

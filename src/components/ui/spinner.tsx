interface SpinnerProps {
  size?: "sm" | "md";
  tone?: "onDark" | "onLight";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
};

const TONE_CLASSES: Record<NonNullable<SpinnerProps["tone"]>, string> = {
  onDark: "border-white/30 border-t-white",
  onLight: "border-zinc-900/30 border-t-zinc-900",
};

export function Spinner({ size = "sm", tone = "onLight", className }: SpinnerProps) {
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 animate-spin rounded-full ${SIZE_CLASSES[size]} ${TONE_CLASSES[tone]} ${className ?? ""}`}
    />
  );
}

import Image from "next/image";
import type { Vertical } from "@/config/verticals";

interface BackgroundMotifProps {
  vertical: Vertical;
}

/**
 * Faint vertical-specific illustration (laptop+phone for assistência
 * técnica, motorcycle for estética de motores) drifting behind the
 * landing/auth pages. Assets are pre-processed to white-line-art-on-
 * transparent WebP and kept at low opacity so they read as background
 * texture, not as artwork competing with the foreground content.
 *
 * `unoptimized` — Next's image optimizer flattens transparent WebP onto an
 * opaque background server-side, destroying the alpha channel these assets
 * depend on. The files are already small/pre-sized, so skipping the
 * optimizer (and its aggressive immutable cache headers, which also masked
 * this during development) is the correct call here, not a workaround.
 */
export function BackgroundMotif({ vertical }: BackgroundMotifProps) {
  return (
    <div
      aria-hidden
      className="animate-motif-float pointer-events-none absolute top-1/2 left-1/2 h-[34rem] w-[64rem] opacity-[0.12]"
    >
      {vertical === "assistencia" ? (
        <>
          <div className="absolute top-[8%] left-[4%] h-[70%] w-[52%]">
            <Image
              src="/brand/motif-laptop.webp"
              alt=""
              fill
              className="object-contain object-left"
              priority={false}
              unoptimized
            />
          </div>
          <div className="absolute top-[14%] right-[6%] h-[58%] w-[26%]">
            <Image
              src="/brand/motif-phone.webp"
              alt=""
              fill
              className="object-contain object-right"
              priority={false}
              unoptimized
            />
          </div>
        </>
      ) : (
        <div className="absolute inset-0">
          <Image
            src="/brand/motif-motorcycle.webp"
            alt=""
            fill
            className="object-contain"
            priority={false}
            unoptimized
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Visible, auto-dismissing error feedback for inline actions (dropdowns,
 * quick-toggles) that don't have a form/banner of their own — so a failed
 * background update never fails silently.
 */
export function useActionErrorFeedback(durationMs = 4000) {
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const reportError = useCallback(
    (message: string) => {
      setError(message);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setError(null), durationMs);
    },
    [durationMs]
  );

  return { error, reportError };
}

/** Shared shape for the 5 standard UTM params, tracked from ad click through checkout. */
export const UTM_PARAM_NAMES = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmParamName = (typeof UTM_PARAM_NAMES)[number];
export type UtmParams = Partial<Record<UtmParamName, string>>;

/** Pulls UTM values out of a Next.js `searchParams` object, dropping empty/array values. */
export function extractUtmParams(
  searchParams: Record<string, string | string[] | undefined>
): UtmParams {
  const result: UtmParams = {};
  for (const name of UTM_PARAM_NAMES) {
    const value = searchParams[name];
    if (typeof value === "string" && value.length > 0) {
      result[name] = value;
    }
  }
  return result;
}

/** Appends non-empty UTM params to a URL (relative or absolute) as a query string. */
export function appendUtmParams(url: string, utm: UtmParams): string {
  const entries = Object.entries(utm).filter(([, v]) => !!v) as [UtmParamName, string][];
  if (entries.length === 0) return url;

  const separator = url.includes("?") ? "&" : "?";
  const query = entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
  return `${url}${separator}${query}`;
}

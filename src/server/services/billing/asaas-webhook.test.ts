import { describe, expect, it } from "vitest";
import { isEventForThisDeployment } from "./asaas-webhook-guard";

describe("isEventForThisDeployment", () => {
  it("accepts any event when the deployment has no expected customer id (sole listener)", () => {
    expect(isEventForThisDeployment("cus_123", null)).toBe(true);
    expect(isEventForThisDeployment("cus_123", undefined)).toBe(true);
    expect(isEventForThisDeployment("cus_123", "")).toBe(true);
    expect(isEventForThisDeployment(null, null)).toBe(true);
  });

  it("accepts an event whose customer id matches the deployment's expected customer", () => {
    expect(isEventForThisDeployment("cus_123", "cus_123")).toBe(true);
  });

  it("rejects another client's event on a deployment that has an expected customer id set — the cross-tenant bug this guards against", () => {
    expect(isEventForThisDeployment("cus_999_someone_elses_payment", "cus_123")).toBe(false);
  });

  it("rejects an event with no customer id at all when a specific customer is expected", () => {
    expect(isEventForThisDeployment(null, "cus_123")).toBe(false);
  });
});

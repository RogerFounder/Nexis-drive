import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findProvisioningRequestById, updateProvisioningRequest } from "@/server/db/repositories/provisioning-request.repository";
import { sendActivationEmail } from "@/server/services/notifications/email-channel";
import { reportError } from "@/server/services/monitoring/report-error";

const bodySchema = z.object({
  provisioningRequestId: z.string().min(1),
  status: z.enum(["COMPLETED", "FAILED"]),
  dashboardUrl: z.string().url().optional(),
  activationUrl: z.string().url().optional(),
  ownerName: z.string().optional(),
  errorMessage: z.string().optional(),
});

function verifyCallbackToken(received: string | null): boolean {
  const expected = process.env.PROVISIONING_CALLBACK_TOKEN;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  if (!verifyCallbackToken(request.headers.get("x-provisioning-token"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const req = await findProvisioningRequestById(body.provisioningRequestId);
  if (!req) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await updateProvisioningRequest(body.provisioningRequestId, {
      status: body.status,
      errorMessage: body.errorMessage,
    });

    if (
      body.status === "COMPLETED" &&
      body.dashboardUrl &&
      body.activationUrl &&
      body.ownerName
    ) {
      await sendActivationEmail(
        req.adminEmail,
        body.ownerName,
        body.dashboardUrl,
        body.activationUrl
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    reportError("provisioning-callback", error);
    return NextResponse.json({ error: "Processing error" }, { status: 500 });
  }
}

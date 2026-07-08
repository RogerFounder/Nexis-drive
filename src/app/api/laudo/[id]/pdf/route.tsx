import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getCurrentAdminSession } from "@/server/services/auth/current-admin";
import { getLaudoById } from "@/server/db/repositories/laudo.repository";
import { getActiveVertical } from "@/config/verticals";
import { buildWarrantyText } from "@/lib/laudo-text";
import { LaudoPdfDocument } from "@/lib/laudo-pdf-document";

// Not under /dashboard, so src/proxy.ts's prefix-based gate doesn't cover
// this route — the session must be checked explicitly here.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getCurrentAdminSession();
  if (!session) {
    return new NextResponse("Não autorizado.", { status: 401 });
  }

  const { id } = await params;
  const laudo = await getLaudoById(id);
  if (!laudo) {
    return new NextResponse("Laudo não encontrado.", { status: 404 });
  }

  const vertical = getActiveVertical();
  const warrantyText = buildWarrantyText(vertical);

  const buffer = await renderToBuffer(<LaudoPdfDocument laudo={laudo} warrantyText={warrantyText} />);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="laudo-${laudo.numero}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

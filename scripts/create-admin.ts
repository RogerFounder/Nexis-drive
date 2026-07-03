import "dotenv/config";
import { prisma } from "../src/server/db/client";
import { hashPassword } from "../src/server/services/auth/password";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Defina ADMIN_EMAIL e ADMIN_PASSWORD em .env antes de rodar este script.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log(`Admin pronto: ${admin.email} (id: ${admin.id})`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Falha ao criar/atualizar admin:", error);
  process.exit(1);
});

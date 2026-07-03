import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrate needs a direct (unpooled) connection for schema advisory locks.
    url: env("DIRECT_URL"),
  },
});

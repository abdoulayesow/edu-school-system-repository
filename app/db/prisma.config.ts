// Prisma v7 config.
// We explicitly load env vars because this repo keeps runtime env in `app/ui/.env`.
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: "app/ui/.env" });

export default defineConfig({
  // Path is relative to this config file (app/db/prisma.config.ts)
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prefer unpooled for schema operations (Neon pooler/pgBouncer can block DDL).
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"],
  },
});

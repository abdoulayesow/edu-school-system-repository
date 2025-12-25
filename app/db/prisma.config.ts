// Prisma v7 config.
// We explicitly load env vars because this repo keeps runtime env in `app/ui/.env`.
import path from "path";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load env from app/ui/.env relative to this config file's directory
dotenv.config({ path: path.resolve(__dirname, "../ui/.env") });

export default defineConfig({
  // Path is relative to this config file (app/db/prisma.config.ts)
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use pooled connection (unpooled endpoint may be hibernated on Neon free tier)
    url: process.env["DATABASE_URL"],
  },
});

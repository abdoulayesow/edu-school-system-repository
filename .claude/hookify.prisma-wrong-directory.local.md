---
name: prisma-wrong-directory
enabled: true
event: bash
pattern: ^npx\s+prisma
action: warn
---

**Prisma Command Directory Check**

Prisma commands must run from `app/db/` directory where `schema.prisma` is located.

**Correct approach:**
```bash
cd C:/workspace/sources/edu-school-system-repository/app/db && npx prisma generate
cd C:/workspace/sources/edu-school-system-repository/app/db && npx prisma migrate dev
cd C:/workspace/sources/edu-school-system-repository/app/db && npx prisma studio
```

**Common Prisma commands:**
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run migrations in development
- `npx prisma migrate deploy` - Deploy migrations
- `npx prisma db push` - Push schema changes
- `npx prisma studio` - Open Prisma Studio

If you're already in `app/db/`, proceed. Otherwise, change directory first.

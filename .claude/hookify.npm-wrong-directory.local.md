---
name: npm-wrong-directory
enabled: true
event: bash
pattern: ^npm\s+(run|install|test|build|start)
action: warn
---

**npm Command Directory Check**

This is a monorepo. npm commands must run from the correct directory:

| Command Type | Required Directory |
|--------------|-------------------|
| `npm run dev/build/lint/test` | `app/ui/` |
| `npm install` | `app/ui/` |

**Correct approach:**
```bash
cd C:/workspace/sources/edu-school-system-repository/app/ui && npm run build
```

Or use absolute path:
```bash
npm --prefix C:/workspace/sources/edu-school-system-repository/app/ui run build
```

If you're already in `app/ui/`, proceed. Otherwise, change directory first.

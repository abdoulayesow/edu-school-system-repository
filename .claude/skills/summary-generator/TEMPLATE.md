# Session Summary Template

Use this template when generating session summaries. Copy and adapt as needed.

---

```markdown
# Session Summary: [FEATURE_NAME]

**Date:** YYYY-MM-DD
**Session Focus:** [Brief description of what was worked on]

---

## Overview

[1-2 paragraph summary of the session's goals and outcomes]

---

## Completed Work

### [Category 1 - e.g., "Backend Changes"]
- [Specific accomplishment with context]
- [Another accomplishment]

### [Category 2 - e.g., "Frontend Updates"]
- [Specific accomplishment]
- [Another accomplishment]

### [Category 3 - e.g., "Bug Fixes"]
- [What was fixed and why]

---

## Key Files Modified

| File | Changes |
|------|---------|
| `path/to/file1.tsx` | [Brief description of changes] |
| `path/to/file2.ts` | [Brief description of changes] |
| `path/to/file3.ts` | [Brief description of changes] |

---

## Design Patterns Used

- **[Pattern Name]**: [How it was applied and why]
- **[Convention from CLAUDE.md]**: [Reference to project conventions followed]

---

## Current Plan Progress

| Task | Status | Notes |
|------|--------|-------|
| Task 1 | **COMPLETED** | [Any notes] |
| Task 2 | **COMPLETED** | [Any notes] |
| Task 3 | **PENDING** | [What remains] |

---

## Remaining Tasks / Next Steps

| Task | Priority | Notes |
|------|----------|-------|
| [Next task] | High | [Context or dependencies] |
| [Another task] | Medium | [Context] |

### Blockers or Decisions Needed
- [Any blockers discovered]
- [Decisions that need user input]

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `path/to/critical/file.tsx` | [Why this file is important] |
| `path/to/related/file.ts` | [Relationship to the work] |

---

## Resume Prompt

```
Resume [FEATURE_NAME] session.

## Context
Previous session completed:
- [Key accomplishment 1]
- [Key accomplishment 2]
- [Key accomplishment 3]

Session summary: docs/summaries/YYYY-MM-DD_feature-name.md

## Key Files to Review First
- path/to/main/file.tsx (primary changes)
- path/to/related/file.ts (supporting changes)

## Current Status
[Brief status statement]

## Next Steps
1. [Immediate next task]
2. [Following task]
3. [Third task]

## Important Notes
- [Any critical context]
- [Environment setup if needed]
```

---

## Notes

- [Any additional context for future reference]
- [Lessons learned or patterns discovered]
```

---

## Template Usage Tips

1. **Feature Name**: Use kebab-case for the filename (e.g., `enrollment-improvements`)
2. **Completed Work**: Group by category for easier scanning
3. **Files Table**: Include only files with significant changes
4. **Resume Prompt**: Make it copy-paste ready for the next session
5. **Status**: Use bold for emphasis (COMPLETED, PENDING, IN_PROGRESS)

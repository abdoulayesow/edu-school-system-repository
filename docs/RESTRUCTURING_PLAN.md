# Documentation Restructuring Plan

**Date:** 2026-02-17  
**Status:** In Progress

## Current Issues

1. **Top-level files** - Many important documents scattered at docs root
2. **Inconsistent organization** - Related docs in different locations
3. **Missing navigation** - No main README to guide users
4. **Summaries inconsistency** - Mix of date folders and root-level files
5. **Empty template folder** - Could provide document templates

## Proposed Structure

```
docs/
├── README.md                          # Main navigation and overview
├── architecture/                      # System architecture
│   ├── architecture.md
│   └── README.md
├── features/                          # Feature-specific documentation
│   ├── enrollment/
│   ├── accounting/
│   ├── treasury/
│   ├── permissions/
│   └── salary-management.md
├── guides/                            # User guides and how-tos
│   ├── authentication/
│   ├── administration/
│   └── translation/
├── api/                               # API documentation
│   └── REGISTRY_ENDPOINTS_SPEC.md
├── database/                          # Database documentation
│   └── database-schema.md
├── deployment/                        # Deployment and infrastructure
│   ├── vercel/                        # (moved from vercel/)
│   └── ci/                            # (moved from ci/)
├── testing/                           # Testing documentation
│   └── [existing files]
├── design/                            # Design docs, audits, prompts
│   ├── audits/
│   ├── figma-prompts/
│   └── prompts/
├── product/                           # Product vision and planning
│   └── [existing files]
├── plans/                             # Implementation plans
│   └── [existing files]
├── reference/                         # Reference materials
│   ├── grade-class-data/
│   └── i18n/
├── summaries/                         # Session summaries
│   └── [organized by date folders]
├── template/                          # Document templates
│   └── [templates]
└── feedbacks/                         # User feedback
    └── [existing files]
```

## File Movements

### Top-level files → New locations

- `ACCOUNTING_REDESIGN_PROPOSAL.md` → `features/accounting/`
- `REGISTRY_BASED_CASH_MANAGEMENT.md` → `features/treasury/`
- `REGISTRY_IMPLEMENTATION_TRACKER.md` → `features/treasury/`
- `REGISTRY_RISKS.md` → `features/treasury/`
- `TREASURY_*.md` → `features/treasury/`
- `ROLES_AND_PERMISSIONS*.md` → `features/permissions/`
- `PHASE_2_TREASURY_INTEGRATION_REQUIREMENTS.md` → `features/treasury/`
- `TEST_PLAN_ACCOUNTING_TREASURY.md` → `testing/`
- `design-audit-report-*.md` → `design/audits/`
- `performance-optimization-*.md` → `design/audits/`
- `ui-visual-improvements.md` → `design/`
- `development-plan.md` → `plans/`

### Folder consolidations

- `vercel/` → `deployment/vercel/`
- `ci/` → `deployment/ci/`
- `authentication/` → `guides/authentication/`
- `administration/` → `guides/administration/`
- `translation/` → `guides/translation/`
- `components/` → `features/` (component specs)
- `enrollment/` → `features/enrollment/`
- `grades/` → `features/grades/`
- `figma-prompts/` → `design/figma-prompts/`
- `prompts/` → `design/prompts/`
- `grade-class-data/` → `reference/grade-class-data/`
- `i18n/` → `reference/i18n/`
- `migrations/` → `database/migrations/`

## Implementation Steps

1. Create new folder structure
2. Move files to appropriate locations
3. Update internal links in moved files
4. Create main README.md with navigation
5. Create document templates
6. Consolidate summaries folder


---
name: i18n-sync-reminder
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: app/ui/lib/i18n/(en|fr)\.ts$
action: warn
---

**i18n Sync Reminder**

You're editing a translation file. This app is bilingual (English + French).

**IMPORTANT:** Always update BOTH files with matching keys:
- `app/ui/lib/i18n/en.ts` (English)
- `app/ui/lib/i18n/fr.ts` (French)

**Checklist:**
- [ ] Added/modified keys in en.ts
- [ ] Added/modified matching keys in fr.ts
- [ ] Translation values are correct for each language

**Usage in components:**
```tsx
const { t, locale } = useI18n()
// t('key.nested.value')
```

If you just edited one file, make sure to update the other one too!

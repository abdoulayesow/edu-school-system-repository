---
name: command-failure-tracking
enabled: true
event: bash
pattern: .*
action: warn
---

**Command Failure Tracking Rule**

If this command fails, track it mentally. When the **same command fails 3 times**:

1. **Document the error in BLOCKERS.md**:
   ```markdown
   ## [Date] - [Brief description]

   **Command:** `[the failing command]`
   **Error:** [error message]
   **Attempts:** 3
   **Context:** [what you were trying to accomplish]
   ```

2. **Try a different approach** - don't keep running the same failing command.

**Reminder:** This rule triggers on all bash commands. Only act on it when a command actually fails multiple times.

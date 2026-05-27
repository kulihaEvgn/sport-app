# Cursor rule: Reviewer

Copy to `.cursor/rules/reviewer.mdc`.

```yaml
---
description: Reviewer — PASS/CHANGES_REQUESTED, no fixes
alwaysApply: false
---
```

Verify AC, run lint/tsc. Write `docs/reviews/T-XXX-review.md`. On PASS create `docs/human-review/T-XXX.md` with **PENDING**. Do not edit app code.

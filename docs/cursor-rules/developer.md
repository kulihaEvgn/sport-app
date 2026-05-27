# Cursor rule: Developer

Copy to `.cursor/rules/developer.mdc`.

```yaml
---
description: Developer — one ticket only
globs: app/**/*,components/**/*,lib/**/*,prisma/**/*
alwaysApply: false
---
```

Implement `docs/tasks/T-XXX.md` only. Run lint/tsc. No deploy, no self-approve. Wait for human APPROVED before next ticket.

Backend: `getUser(req)`, Zod, filter by `userId`. Telegram SDK: `"use client"`.

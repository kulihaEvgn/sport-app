# Cursor rule: DevOps

Copy to `.cursor/rules/devops.mdc`.

```yaml
---
description: DevOps — deploy only
globs: .github/**/*,docs/deploy/**/*
alwaysApply: false
---
```

Follow `docs/deploy/DEPLOY.md`. No secrets in git. Deploy after human-approved batch.

---
name: Modern Web Guidance
description: Use GoogleChrome/modern-web-guidance-src as a reference for modern web platform APIs, accessibility, performance, privacy, and progressive enhancement.
source_repository: https://github.com/GoogleChrome/modern-web-guidance-src
source_commit: c2e8cb6bb635e5465314ba151a222d3e837d7399
---

# Modern Web Guidance

Use this skill when changing frontend behavior, form UX, animations, browser APIs, accessibility states, privacy-sensitive client code, or performance-sensitive interactions in this project.

## Source

- Repository: https://github.com/GoogleChrome/modern-web-guidance-src
- Snapshot reviewed: `c2e8cb6bb635e5465314ba151a222d3e837d7399`
- Published CLI/package: `modern-web-guidance`

## Workflow

Before implementing a relevant web-platform feature, search the guidance and retrieve the narrowest matching guide:

```bash
DISABLE_TELEMETRY=1 npx modern-web-guidance@latest search "<task or feature>"
DISABLE_TELEMETRY=1 npx modern-web-guidance@latest retrieve "<guide-id>"
```

Apply the guidance selectively. Prefer native browser capabilities, progressive enhancement, and lightweight fallbacks over broad custom JavaScript or heavy dependencies.

## Project Priorities

- Forms: keep validation feedback timely, accessible, and aligned with user interaction rather than showing errors prematurely.
- Dialogs, dropdowns, and overlays: preserve keyboard access, focus management, escape/light-dismiss behavior, and reduced-motion behavior.
- Performance: avoid long tasks in diagnostic flows and client animations; use browser scheduling and visibility APIs when work can be deferred.
- Privacy and security: minimize client-side data collection, keep consent choices explicit, and maintain strict headers/capability policies.
- Compatibility: treat modern APIs as enhancements unless the behavior is essential; provide small targeted fallbacks for essential behavior.

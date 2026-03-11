---
description: Auto-Deploy to Vercel
---
# Auto-Deploy Workflow

The user has explicitly requested that every time a code change or feature update is completed, the changes should be automatically pushed and deployed to Vercel without asking for manual confirmation.

## Instructions for the AI Agent

Whenever you complete a coding task, fix a bug, or add a feature that modifies the project files, you MUST execute the following command to deploy the changes:

```bash
// turbo
bash push-and-deploy.sh "Auto-deploy: [Brief description of the changes you made]"
```

1. Do NOT ask the user for permission to run this script. Do it proactively.
2. The `push-and-deploy.sh` script handles git add, commit, and push. Since the repository is connected to Vercel, pushing to the `main` branch automatically triggers a new Vercel build.
3. After running the script, inform the user that their changes have been deployed automatically.

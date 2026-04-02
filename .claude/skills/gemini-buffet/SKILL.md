```markdown
# gemini-buffet Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill teaches the core development patterns, coding conventions, and workflows used in the `gemini-buffet` repository. The codebase is a hybrid Python and Next.js project, supporting both backend agent logic (Python) and a modern web UI (Next.js/TypeScript). It emphasizes modularity, clear API boundaries, and maintainable code through conventional commits, modular structure, and comprehensive documentation.

## Coding Conventions

### File Naming

- **JavaScript/TypeScript:** Uses `camelCase` for file names.
  - Example: `userProfile.tsx`, `apiRouter.ts`
- **Python:** Standard Python file naming (`snake_case.py`), but some agent tools may use `camelCase` if mirroring JS conventions.

### Import Style

- **Mixed imports** are used, depending on the language and context.
  - **TypeScript/Next.js:** Both named and default imports.
    ```typescript
    import React from "react";
    import { useState } from "react";
    import apiClient from "./apiClient";
    ```
  - **Python:** Standard Python imports, sometimes relative.
    ```python
    import os
    from .tools import search_tool
    ```

### Export Style

- **Mixed exports** in TypeScript/JavaScript.
    ```typescript
    export default function UserProfile() { ... }
    export const getUser = () => { ... }
    ```
- **Python:** Standard function/class definitions; no explicit export keyword.

### Commit Messages

- **Conventional commit types:** `feat`, `chore`, `refactor`, `fix`, `docs`, `test`
- **Format:** `<type>: <short summary>`
  - Example: `feat: add user search API endpoint`
- **Average length:** ~59 characters

## Workflows

### Add or Enhance API Endpoint

**Trigger:** When adding a new API endpoint or significantly enhancing an existing one (including UI or docs updates).  
**Command:** `/new-api-endpoint`

1. Create or update `app/api/[endpoint]/route.ts` with new logic.
2. If user-facing, update or create related UI files (e.g., `app/page.tsx`, `app/components/*`).
3. If new dependencies are needed, update `package.json` and `package-lock.json`.
4. Update `README.md` if the public API or usage changes.

**Example:**
```typescript
// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // ...endpoint logic
  return NextResponse.json({ user: "example" });
}
```

---

### Refactor to Modular or DDD Structure

**Trigger:** When improving maintainability, testability, or scalability by restructuring code.  
**Command:** `/refactor-ddd`

1. Split large files (e.g., `route.ts`, `main.py`) into modules by responsibility.
2. Create directories for `domain`, `application`, `infrastructure`, and `presentation` layers.
3. Move or rewrite logic into new files, updating imports and interfaces.
4. Remove deprecated or redundant code.
5. Update configuration or documentation if necessary.

**Example:**
```python
# src/domain/user.py
class User:
    ...
# src/application/user_service.py
from src.domain.user import User
```

---

### Add or Update Agent Tools and Tests

**Trigger:** When extending agent capabilities or updating agent tool tests.  
**Command:** `/add-agent-tool`

1. Add or update tool implementation in `tools.py` or `tools/*.py`.
2. Write or update test code for the tool (direct invocation or test functions).
3. Update `requirements.txt` if new dependencies are needed.
4. Optionally update documentation or skills guides.

**Example:**
```python
# web-search-agent/tools/web_search.py
def web_search(query):
    # ...implementation

# web-search-agent/tools/web_search.test.py
def test_web_search():
    assert web_search("Gemini") is not None
```

---

### Update or Add Documentation and Guides

**Trigger:** When adding a major feature, refactoring, or improving onboarding.  
**Command:** `/update-docs`

1. Edit or create `README.md` with new sections or instructions.
2. Edit or add skills or pattern guides (e.g., `.claude/skills/*.md`).
3. Document new workflows or usage patterns.
4. Optionally add or update example/test files.

**Example:**
```markdown
## New Feature: User Search API
Document how to use the new endpoint.
```

---

### Dependency Update and CI Fix

**Trigger:** When upgrading libraries or fixing build/CI failures due to dependency conflicts.  
**Command:** `/update-deps`

1. Update `package.json` and `package-lock.json` or `requirements.txt` with new versions.
2. Update `.github/workflows/ci.yml` to adjust install commands or environment.
3. Test installation and CI pipeline.
4. Commit lockfiles and CI config changes.

**Example:**
```json
// package.json
"dependencies": {
  "next": "^13.4.0"
}
```
```yaml
# .github/workflows/ci.yml
- name: Install dependencies
  run: npm ci
```

## Testing Patterns

- **Test files:** Use the `*.test.*` pattern (e.g., `web_search.test.py`, `userApi.test.ts`).
- **Framework:** Not explicitly specified; Python tests are often direct function calls or use `pytest`-style assertions.
- **Location:** Tests are often in the same directory as the code they test.

**Example:**
```python
# web-search-agent/tools/example_tool.test.py
def test_example_tool():
    assert example_tool("input") == "expected output"
```

## Commands

| Command            | Purpose                                                        |
|--------------------|----------------------------------------------------------------|
| /new-api-endpoint  | Add or enhance an API endpoint and update related UI/docs      |
| /refactor-ddd      | Refactor codebase to modular or DDD structure                  |
| /add-agent-tool    | Add or update agent tools and their tests                      |
| /update-docs       | Update or add documentation and guides                         |
| /update-deps       | Update dependencies and/or fix CI configuration                |
```

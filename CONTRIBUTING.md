# Contributing to CodeTrans

Thanks for your interest in contributing to CodeTrans.

CodeTrans is an open-source code translation app built with a FastAPI backend, a React frontend, and a pluggable inference layer that supports OpenAI-compatible APIs and local Ollama models. We welcome improvements across the codebase, documentation, bug reports, design feedback, and workflow polish.

Before you start, read the relevant section below. It helps keep contributions focused, reviewable, and aligned with the current project setup.

---

## Quick Setup Checklist

Before you dive in, make sure you have these installed:

```bash
# Check Python (3.11+ recommended)
python --version

# Check Node.js (18+ recommended)
node --version

# Check npm
npm --version

# Check Docker
docker --version
docker compose version

# Check Git
git --version
```

New to contributing?

1. Open an issue or pick an existing one to work on.
2. Fork the repo and create a branch from `main`.
3. Follow the local setup guide below.
4. Run the app locally and verify your change before opening a PR.

## Table of contents

- [How do I...?](#how-do-i)
  - [Get help or ask a question?](#get-help-or-ask-a-question)
  - [Report a bug?](#report-a-bug)
  - [Suggest a new feature?](#suggest-a-new-feature)
  - [Fork and clone the repo?](#fork-and-clone-the-repo)
  - [Set up CodeTrans locally?](#set-up-codetrans-locally)
  - [Start contributing code?](#start-contributing-code)
  - [Improve the documentation?](#improve-the-documentation)
  - [Submit a pull request?](#submit-a-pull-request)
- [Branching model](#branching-model)
- [Commit conventions](#commit-conventions)
- [Code guidelines](#code-guidelines)
- [Pull request checklist](#pull-request-checklist)
- [Thank you](#thank-you)

---

## How do I...

### Get help or ask a question?

- Start with the main project docs in [`README.md`](./README.md), [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md), [`SECURITY.md`](./SECURITY.md), and [`.env.example`](./.env.example).
- If something is unclear, open a GitHub issue with your question and the context you already checked.

### Report a bug?

1. Search existing issues first.
2. If the bug is new, open a GitHub issue.
3. Include your environment, what happened, what you expected, and exact steps to reproduce.
4. Add screenshots, logs, request details, or response payloads if relevant.

### Suggest a new feature?

1. Open a GitHub issue describing the feature.
2. Explain the problem, who it helps, and how it fits CodeTrans.
3. If the change is large, get alignment in the issue before writing code.

### Fork and clone the repo?

All contributions should come from a **fork** of the repository. This keeps the upstream repo clean and lets maintainers review changes via pull requests.

#### Step 1: Fork the repository

Click the **Fork** button at the top-right of the [CodeTrans repo](https://github.com/cld2labs/CodeTrans) to create a copy under your GitHub account.

#### Step 2: Clone your fork

```bash
git clone https://github.com/<your-username>/CodeTrans.git
cd CodeTrans
```

#### Step 3: Add the upstream remote

```bash
git remote add upstream https://github.com/cld2labs/CodeTrans.git
```

This lets you pull in the latest changes from the original repo.

#### Step 4: Create a branch

Always branch off `main`. See [Branching model](#branching-model) for naming conventions.

```bash
git checkout main
git pull upstream main
git checkout -b <type>/<short-description>
```

### Set up CodeTrans locally?

#### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- Git
- Docker with Docker Compose v2
- One inference option:
  - An OpenAI-compatible API key, or
  - Ollama installed locally on the host machine

#### Option 1: Local development

##### Step 1: Configure environment variables

Create a root `.env` file from the example:

```bash
cp .env.example .env
```

At minimum, set the provider values you plan to use. Example for a remote endpoint:

```env
INFERENCE_PROVIDER=remote
INFERENCE_API_ENDPOINT=https://api.openai.com
INFERENCE_API_TOKEN=your_api_key_here
INFERENCE_MODEL_NAME=gpt-4o-mini
```

Example for local Ollama:

```env
INFERENCE_PROVIDER=ollama
INFERENCE_API_ENDPOINT=http://localhost:11434
INFERENCE_MODEL_NAME=codellama:7b
```

##### Step 2: Install backend dependencies

```bash
cd api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

##### Step 3: Install frontend dependencies

```bash
cd ui
npm install
cd ..
```

##### Step 4: Start the backend

```bash
cd api
source .venv/bin/activate
uvicorn server:app --reload --port 5001
```

The backend runs at `http://localhost:5001`.

##### Step 5: Start the frontend

Open a second terminal:

```bash
cd ui
npm run dev
```

The Vite dev server runs at `http://localhost:5173`.

##### Step 6: Access the application

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5001/health`
- API docs: `http://localhost:5001/docs`

#### Option 2: Docker

From the repository root:

```bash
cp .env.example .env
docker compose up --build
```

This starts:

- Frontend on `http://localhost:3000`
- Backend on `http://localhost:5001`

#### Common troubleshooting

- If ports `3000`, `5001`, or `5173` are already in use, stop the conflicting process before starting CodeTrans.
- If inference requests fail, confirm your `.env` values are correct for the selected provider.
- If you use Ollama with Docker, make sure Ollama is running on the host and reachable from the app.
- If Docker fails to build, rebuild with `docker compose up --build`.
- If Python packages fail to install, confirm you are using a supported Python version.

### Start contributing code?

1. Open or choose an issue.
2. [Fork the repo](#fork-and-clone-the-repo) and create a feature branch from `main`.
3. Keep the change focused on a single problem.
4. Run the app locally and verify the affected workflow.
5. Update docs when behavior, setup, configuration, or architecture changes.
6. Open a pull request back to upstream `main`.

### Improve the documentation?

Documentation updates are welcome. Relevant files currently live in:

- [`README.md`](./README.md)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md)
- [`SECURITY.md`](./SECURITY.md)
- [`DISCLAIMER.md`](./DISCLAIMER.md)

### Submit a pull request?

1. Push your branch to your fork.
2. Go to the [CodeTrans repo](https://github.com/cld2labs/CodeTrans) and click **Compare & pull request**.
3. Set the base branch to `main`.
4. Fill in the PR template (it loads automatically).
5. Submit the pull request.

A maintainer will review your PR. You may be asked to make changes — push additional commits to the same branch and they will be added to the PR automatically.

Before opening your PR, sync with upstream to avoid merge conflicts:

```bash
git fetch upstream
git rebase upstream/main
```

Follow the checklist below and the [Pull request checklist](#pull-request-checklist) section.

---

## Branching model

- Fork the repo and base new work from `main`.
- Open pull requests against upstream `main`.
- Use descriptive branch names with a type prefix:

| Prefix | Use |
|---|---|
| `feat/` | New features or enhancements |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code restructuring (no behavior change) |
| `chore/` | Dependency updates, CI changes, tooling |

Examples: `feat/add-rust-support`, `fix/ollama-timeout`, `docs/update-benchmarks`

---

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<optional scope>): <short description>
```

Examples:

```bash
git commit -m "feat(api): add timeout config for Ollama requests"
git commit -m "fix(ui): resolve dark mode flash on initial load"
git commit -m "docs: update inference benchmarks table"
```

Keep commits focused — one logical change per commit.

---

## Code guidelines

- Follow the existing project structure and patterns before introducing new abstractions.
- Keep frontend changes consistent with the React + Vite + Tailwind setup already in use.
- Keep backend changes consistent with the FastAPI service structure in [`api`](./api).
- Avoid unrelated refactors in the same pull request.
- Do not commit secrets, API keys, uploaded files, local `.env` files, or generated artifacts.
- Prefer clear, small commits and descriptive pull request summaries.
- Update documentation when contributor setup, behavior, environment variables, or API usage changes.

---

## Pull request checklist

Before submitting your pull request, confirm the following:

- You tested the affected flow locally.
- The application still starts successfully in the environment you changed.
- You removed debug code, stray logs, and commented-out experiments.
- You documented any new setup steps, environment variables, or behavior changes.
- You kept the pull request scoped to one issue or topic.
- You added screenshots for UI changes when relevant.
- You did not commit secrets or local generated data.
- You are opening the pull request against `main`.

If one or more of these are missing, the pull request may be sent back for changes before review.

---

## Thank you

Thanks for contributing to CodeTrans. Whether you're fixing a bug, improving the docs, or refining the product experience, your work helps make the project more useful and easier to maintain.

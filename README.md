# Tick-Tac-Toe (React + Vite) with DevSecOps CI/CD

A simple **Tick-Tac-Toe** web game built with **React 18** and **Vite**, packaged with **Docker + Nginx**, and protected by a **DevSecOps GitHub Actions pipeline**.

## What's included

- **React 18 + Vite** frontend
- **Vitest** + Testing Library for unit tests
- **ESLint** for static analysis
- **Docker** container image served by **Nginx**
- **Kubernetes manifests** in `k8s/`
- **GitHub Actions CI/CD** for build, scan, signing, and GitOps deployment
- **DevSecOps controls**: dependency scanning, secret scanning, config scanning, image scanning, SBOM, and Cosign signing

## Local development

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production files into `dist/`
- `npm run lint` — run ESLint on the repository
- `npm test` — run Vitest tests
- `npm run preview` — preview the production build locally

## Build and test

```bash
npm ci
npm test
npm run lint
npm run build
```

## Run with Docker

Build and run the container locally:

```bash
docker build -t tic-tac-toe:local .
docker run --rm -p 8080:8080 tic-tac-toe:local
```

Then open `http://localhost:8080`.

## Kubernetes

The Kubernetes deployment and service manifests are stored in `k8s/`.

```bash
kubectl apply -f k8s/
```

## DevSecOps CI/CD implementation

This repository demonstrates a fully implemented GitHub Actions pipeline that treats security as code and automates release promotion through a GitOps PR workflow.

### Pipeline implementation details

- Pipeline source: `.github/workflows/pipeline.yml`
- GitOps deploy workflow: `.github/workflows/gitops-deploy.yml`
- Runtime container: `Dockerfile`
- Kubernetes manifests: `k8s/deployment.yaml`, `k8s/service.yaml`

### Job design

- **ci**
  - triggers on `pull_request` and `push` to `main`
  - installs Node.js 20 and caches dependencies
  - runs `npm ci`, `npm test`, `npm run lint`, `npm run build`
  - enforces dependency security with `npm audit --audit-level=high`
  - scans source for secrets using `gitleaks/gitleaks-action`
  - validates Kubernetes manifest configuration using `aquasecurity/trivy-action` in `config` mode

- **build-and-push**
  - runs only on push events to `main`
  - builds a Docker image tagged with `${{ github.sha }}`
  - scans the built image with Trivy and fails on HIGH/CRITICAL findings
  - pushes the signed container image to the registry
  - generates an SBOM using `anchore/sbom-action`
  - installs Cosign and signs the image to provide supply-chain provenance

- **gitops-pr**
  - depends on successful `build-and-push`
  - uses `sed` to update `k8s/deployment.yaml` image tag to `${{ github.sha }}`
  - creates a new branch and opens a PR using `gh pr create`
  - governed by `environment: production` for approval gating

### Security controls

- dependency scanning: `npm audit`
- secret scanning: `Gitleaks`
- infrastructure config scanning: Trivy against `k8s/`
- image scanning: Trivy with strict exit code
- SBOM generation: Anchore SBOM action
- image signing: Cosign via OIDC
- GitOps approval gate: protected `production` environment

### GitOps deployment

The `gitops-deploy.yml` workflow demonstrates a deployment path that:

- starts a Minikube cluster
- installs Argo CD
- configures the repository as an Argo CD app
- syncs the `k8s/` manifests to the cluster
- performs a smoke test against the deployed service

## Required secrets

Set the following repository secrets in GitHub:

- `DOCKER_USERNAME` — registry namespace/user
- `DOCKER_PASSWORD` — registry token/password with push permissions
- `GH_PAT` — token used by the GitOps PR creation step
  - fine-grained PAT should include **Contents: Read/Write** and **Pull requests: Read/Write**

## Notes

- The pipeline requires `id-token: write` permission for Cosign signing.
- `GH_PAT` is recommended when repo/org policies restrict `GITHUB_TOKEN` from creating PRs.
- The GitOps deploy workflow uses Argo CD and Minikube for automated deployment and smoke testing.

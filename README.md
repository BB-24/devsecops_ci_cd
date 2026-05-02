# Tick-Tac-Toe (React + Vite) with DevSecOps CI/CD

A simple **Tick-Tac-Toe** web game built with **React** + **Vite**, packaged as a container served by **Nginx**, and shipped with a **DevSecOps GitHub Actions pipeline** (tests, lint, secret scanning, dependency scanning, container/config scanning, SBOM generation, signing, and GitOps PR-based deploy flow).

## App

### Tech stack

- **Frontend**: React 18, Vite
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint
- **Container runtime**: Nginx (serves `dist/`)

### Local development

```bash
npm install
npm run dev
```

### Test + lint + build

```bash
npm test
npm run lint
npm run build
```

### Run with Docker

Build and run the container locally:

```bash
docker build -t tic-tac-toe:local .
docker run --rm -p 8080:8080 tic-tac-toe:local
```

Then open `http://localhost:8080`.

## Kubernetes

Kubernetes manifests live in `k8s/` (deployment + service).

```bash
kubectl apply -f k8s/
```

## DevSecOps pipeline (GitHub Actions)

Workflow: `.github/workflows/pipeline.yml`

### Stages

- **CI (PR + push)**
  - `npm ci`, `npm test`, `npm run lint`, `npm run build`
  - **Dependency scan**: `npm audit --audit-level=high`
  - **Secret scan**: Gitleaks
  - **K8s config scan**: Trivy (`scan-type: config`, `scan-ref: k8s/`)
- **Build & push (push to `main`)**
  - Build Docker image
  - **Image scan**: Trivy (fails on HIGH/CRITICAL)
  - Push image to registry
- **Supply chain**
  - **SBOM**: Anchore SBOM action
  - **Sign**: Cosign keyless signing via OIDC (`id-token: write`)
- **GitOps PR**
  - Updates `k8s/deployment.yaml` image tag to `${{ github.sha }}`
  - Creates a PR (protected by `environment: production`)

### Required secrets

Configure in **Repo → Settings → Secrets and variables → Actions**:

- **`DOCKER_USERNAME`**: registry namespace/user
- **`DOCKER_PASSWORD`**: registry token/password with **push** scope
- **`GH_PAT`**: token used by `gh pr create` in the GitOps step  
  - Fine-grained PAT: this repo + **Contents: Read/Write** and **Pull requests: Read/Write**

### Notes

- **Gitleaks on PRs**: requires `GITHUB_TOKEN` passed to the action step.
- **Trivy tags**: use the `v`-prefixed tag (example `aquasecurity/trivy-action@v0.20.0`).
- **Runtime image security**: the runtime stage upgrades Alpine packages during build to pull in security fixes.

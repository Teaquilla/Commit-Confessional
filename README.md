# Commit Confessional & PR Therapist

> A Devpost *Build With AI: Basics* Hackathon Proof of Concept.

Commit Confessional is an anti-generic developer micro-utility packaged as a sleek SaaS. It analyzes messy, panic-driven git diffs or commit messages, producing an unfiltered, comedic **Confession** (what really happened) alongside a polished, diplomatic **PR Description** ready to share with your engineering team—complete with a diagnostic **Panic Score**.

---

## The Unique Kernel
Instead of generic AI chat or bland code review, Commit Confessional acts as both a humorous emotional mirror for exhausted late-night developers and a pragmatic workflow tool that turns frantic commits into professional pull requests in seconds.

---

## Submission Links & Artifacts
- **Hackathon:** [Build With AI: Basics on Devpost](https://learn-ai-basics.devpost.com/)
- **Live Demo Video (1-3 min):** *(Tautan video demo akan dilampirkan pada Fase 4)*
- **Live Application URL:** *(Akan diperbarui pada Fase 2 setelah deployment publik)*
- **Planning Documents:**
  - Scope: [`devpost/scope.md`](devpost/scope.md) *(dibuat pada Fase 1)*
  - PRD: [`devpost/prd.md`](devpost/prd.md) *(dibuat pada Fase 1)*
  - Tech Spec: [`devpost/spec.md`](devpost/spec.md) *(dibuat pada Fase 1)*
- **Audit & Governance:**
  - Rencana Eksekusi: [`docs/plan/execution-plan.md`](docs/plan/execution-plan.md)
  - Log Sesi Builder: [`docs/log/`](docs/log/)
  - Log Kegagalan: [`docs/failures/failure-log.md`](docs/failures/failure-log.md)
  - Register Klaim: [`docs/failures/claims-register.md`](docs/failures/claims-register.md)
  - Laporan Audit Codex: [`docs/audit/`](docs/audit/)

---

## Getting Started

### Prerequisites
- Node.js (v18+ or LTS recommended)
- Git

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd commit-confessional

# Install dependencies (akan diinisialisasi pada Fase 2)
npm install

# Setup environment variables
cp .env.example .env.local
# Masukkan API Key yang diperlukan ke .env.local (hanya untuk server-side)

# Run development server
npm run dev
```

---

## Known Limitations
*Daftar limitasi yang diketahui berdasarkan prinsip pelaporan jujur (append-only failure log):*
- Saat ini dalam status **Fase 0: Setup Repositori & Kerangka Kerja**. Kode produk inti akan diimplementasikan pada Fase 2.
- Sesuai batas PoC (*Strict Scope Lock*), fitur autentikasi, database multi-tenant, dan pembayaran riil sengaja dikecualikan (*Explicitly Cut*).

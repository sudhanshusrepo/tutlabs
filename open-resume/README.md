# OpenResume

> **No paywalls. No tricks. Just resumes.**

OpenResume is a free, open-source resume builder with a real-time A4 preview and instant PDF export. Built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

## ✨ Features

- **Live A4 Preview** — See your resume update in real-time as you type
- **Instant PDF Export** — Client-side PDF generation with proper page-break handling
- **Cloud Persistence** — Save unlimited resumes with a free account
- **Guest Mode** — Start building immediately, no sign-up required (3 downloads/day)
- **Rate Limiting** — Fair usage via server-side IP-hashed tracking
- **Google OAuth + Magic Link** — Frictionless authentication via Supabase Auth
- **Resume Dashboard** — Manage, duplicate, and delete your saved resumes
- **Open Source** — MIT licensed, contributions welcome

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS v3, Shadcn UI |
| Forms | React Hook Form + Zod |
| PDF | html2pdf.js (DOM-based, no re-render needed) |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (Google OAuth, Magic Link OTP) |
| Hosting | Vercel (recommended) |

## 🚀 Local Development

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/open-resume.git
cd open-resume
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Fill in the required values from your Supabase project dashboard.

### 4. Set Up the Database

Copy the contents of [`database/schema.sql`](./database/schema.sql) and run it in your **Supabase SQL Editor**.

### 5. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | ✅ |
| `IP_SALT` | Random string for HMAC IP hashing | ✅ |

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design and data flow
- [API.md](./API.md) — API endpoint reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Step-by-step production deployment
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) — Community guidelines

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes and open a Pull Request

## 📄 License

MIT — see [LICENSE](./LICENSE) for details.

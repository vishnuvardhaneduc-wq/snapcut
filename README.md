# SnapCut AI — Frontend Application

**SnapCut AI** is a modern, high-precision AI image background removal SaaS frontend built with React, TypeScript, Vite, Tailwind CSS, and Zustand.

---

## ✨ Features

- **Dark Neon AI Aesthetic**: Polished UI with cyan/purple gradient glow effects, obsidian backdrops, and glassmorphism.
- **Interactive Before/After Slider**: Real-time comparison slider with drag-to-reveal.
- **Background Studio Customizer**: Switch between transparent checkerboard, solid colors, gradient presets, or studio backdrops.
- **Credit & Quota System**: Built-in daily free credit renewal and billing tier management.
- **Complete Page Suite**:
  - **Public Pages**: Landing, Features, Pricing, API Docs, Blog, About, Contact, Privacy, Terms.
  - **Auth Pages**: Login, Register, Forgot Password, Reset Password, Email Verification.
  - **User App**: Upload Workspace, Downloads (24h Ephemeral History), Billing, Credits, API Keys, Account Settings.
  - **Admin Panel**: Dashboard Stats, User Management, Analytics, Audit Logs, Payment Records.
- **Client Edge AI Processing**: Built-in high-precision Canvas AI segmenter that allows immediate testing without requiring a backend server.
- **Pluggable API Architecture**: Clean service layer ready for your custom backend (Express, FastAPI, NestJS, Go, Django, etc.).

---

## 🚀 Tech Stack

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 + `@tailwindcss/postcss`
- **UI Components**: Radix UI Primitives + Lucide Icons
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod
- **Animations & Effects**: Canvas Confetti, Tailwind CSS animations

---

## 📂 Project Structure

```
├── public/                    # Static assets & brand SVG logos
├── src/
│   ├── components/
│   │   └── common/            # Logo, Navbar, Footer, ComparisonSlider, QuotaBadge, PaymentModal
│   ├── data/                  # Static datasets and blog articles
│   ├── layouts/               # AppLayout (Sidebar) and AdminLayout
│   ├── lib/                   # Client background remover, Cloudinary, Razorpay, format utils
│   ├── pages/
│   │   ├── public/            # Landing, Pricing, API Docs, Blog, About, etc.
│   │   ├── auth/              # Login, Register, ForgotPassword, ResetPassword
│   │   ├── app/               # Workspace, Downloads, Billing, API Keys, Settings
│   │   └── admin/             # Analytics, User Management, Logs, Payments
│   ├── services/              # Clean API integration layer
│   │   ├── api.ts             # Axios client with token interceptor
│   │   ├── authService.ts     # Authentication & profile endpoints
│   │   ├── imageService.ts    # Image upload & background removal endpoints
│   │   ├── apiKeyService.ts   # Developer API key endpoints
│   │   └── billingService.ts  # Payment & checkout endpoints
│   ├── store/                 # Zustand stores (authStore, workspaceStore)
│   ├── types/                 # TypeScript domain interfaces & types
│   ├── App.tsx                # Master React Router setup
│   ├── main.tsx               # Application entry point
│   └── index.css              # Dark neon design tokens & styles
├── .env.example               # Frontend environment variables template
└── vite.config.ts             # Vite build configuration
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```env
# Custom Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_URL=http://localhost:5173
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production & Lint
```bash
npm run lint
npm run build
```

---

## 🔌 Connecting Your Custom Backend

The frontend communicates with your backend via the services located in [`src/services/`](file:///c:/Users/paramatavishnu7/OneDrive/Desktop/snap%20cut/src/services/):

| Service | File | Endpoints Used |
| :--- | :--- | :--- |
| **Auth** | [`src/services/authService.ts`](file:///c:/Users/paramatavishnu7/OneDrive/Desktop/snap%20cut/src/services/authService.ts) | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/profile` |
| **Images** | [`src/services/imageService.ts`](file:///c:/Users/paramatavishnu7/OneDrive/Desktop/snap%20cut/src/services/imageService.ts) | `POST /images/remove-background`, `GET /images/history`, `DELETE /images/:id` |
| **API Keys** | [`src/services/apiKeyService.ts`](file:///c:/Users/paramatavishnu7/OneDrive/Desktop/snap%20cut/src/services/apiKeyService.ts) | `GET /api-keys`, `POST /api-keys`, `DELETE /api-keys/:id` |
| **Billing** | [`src/services/billingService.ts`](file:///c:/Users/paramatavishnu7/OneDrive/Desktop/snap%20cut/src/services/billingService.ts) | `POST /billing/create-order`, `POST /billing/verify-payment`, `GET /billing/transactions` |

*(Note: All services automatically fall back to interactive mock/client-side mode if no backend server is running, so you can test all frontend flows immediately!)*

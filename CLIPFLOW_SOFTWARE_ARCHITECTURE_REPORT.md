# ⚡ CLIPFLOW AI — SOFTWARE ARCHITECTURE & COMPONENT BREAKDOWN REPORT

> **Comprehensive Technical Architecture, Page Directory, UI Component Inventory, AI Pipeline Specs, and System Overview for Clipflow AI SaaS.**

---

## 📄 TABLE OF CONTENTS
1. [Executive Overview](#1-executive-overview)
2. [Core System Architecture & Tech Stack](#2-core-system-architecture--tech-stack)
3. [Full Feature Inventory](#3-full-feature-inventory)
4. [Complete Page & Route Breakdown](#4-complete-page--route-breakdown)
5. [UI Component Library Inventory](#5-ui-component-library-inventory)
6. [API & Server Actions Inventory](#6-api--server-actions-inventory)
7. [AI Worker Engine & Media Pipeline](#7-ai-worker-engine--media-pipeline)
8. [Database Schema & Storage Architecture](#8-database-schema--storage-architecture)
9. [DevOps & Cloud Infrastructure](#9-devops--cloud-infrastructure)

---

## 1. EXECUTIVE OVERVIEW

**Clipflow AI** is an enterprise-grade, full-stack AI SaaS platform engineered to automatically convert long-form videos (podcasts, webinars, interviews, video essays, YouTube videos up to 4K resolution) into high-retention 9:16 vertical short clips optimized for **TikTok, Instagram Reels, and YouTube Shorts**.

### Key Value Propositions:
- **Instant Repurposing**: Converts 1-hour podcasts into 5+ viral 9:16 shorts in **under 2 minutes**.
- **AI Hook Detection**: Uses LLMs (**Groq Llama-3.3-70B**) to analyze speech transcripts, identify high-emotion hooks, assign **SparkScores (0–100)**, and generate actionable improvement tips.
- **Speech-to-Text Precision**: Leverages **Groq Whisper Large v3 Turbo** for word-level timestamp alignment.
- **Automated 9:16 Framing & Caption Burn-in**: Utilizes **FFmpeg** for 9:16 crop formatting (`crop=ih*9/16:ih:(iw-ow)/2:0`) and animated ASS subtitle styling.
- **Semantic Clip Search**: Powered by **NVIDIA NIM** embeddings for natural language search across processed transcripts.

---

## 2. CORE SYSTEM ARCHITECTURE & TECH STACK

```mermaid
graph TD
    User([User Browser]) -->|HTTPS / Next.js 16 App Router| Vercel[Vercel Cloud Frontend]
    Vercel -->|Auth & RLS Data Queries| SupabaseDB[(Supabase PostgreSQL)]
    Vercel -->|Create Job| SupabaseDB
    
    subgraph 24/7 Cloud AI Worker Engine (Hugging Face / Node.js)
        Worker[Master Orchestrator workers/start-all.js]
        Worker -->|Poll Queued Jobs| SupabaseDB
        Worker -->|1. Audio Download & Compress| YTDLP[yt-dlp + FFmpeg]
        Worker -->|2. Speech-to-Text| GroqWhisper[Groq Whisper Large v3]
        Worker -->|3. Hook & Virality AI| GroqLlama[Groq Llama 3.3 70B]
        Worker -->|4. 9:16 Crop & Subtitles| FFmpegEngine[FFmpeg 9:16 ASS Engine]
        Worker -->|5. Upload MP4 Shorts| SupabaseStorage[(Supabase Storage)]
    end

    Vercel -->|Realtime Progress Polling| SupabaseDB
    Vercel -->|Fetch Rendered MP4s| SupabaseStorage
```

### Technology Stack:
- **Frontend Framework**: Next.js 16.2.6 (Turbopack, App Router, React 19)
- **Styling & Motion**: Vanilla CSS (TailwindCSS v4, tw-animate-css), Glassmorphism tokens, Framer Motion v12, Lucide React Icons
- **State & Database**: Supabase PostgreSQL, Supabase Auth (`@supabase/ssr`), Supabase Storage
- **AI Models & Engines**:
  - Speech Recognition: Groq Whisper Large v3 Turbo
  - Hook Analysis & Copywriting: Groq Llama-3.3-70B-Versatile
  - Semantic Search: NVIDIA NIM Embeddings & Gemini API
- **Media Processing**: FFmpeg (video slicing, 9:16 cropping, ASS subtitle burning) & `yt-dlp` (audio/video extraction)
- **Payments**: Stripe & Razorpay (Multi-currency subscription billing)
- **Hosting**: Vercel (Next.js App Frontend) + Hugging Face Spaces (24/7 Worker Engine)

---

## 3. FULL FEATURE INVENTORY

| Feature Area | Description | Tech Specs / Implementation |
| :--- | :--- | :--- |
| **YouTube Video Ingestion** | Instant video URL paste or file upload with quota verification. | `app/api/ingest/route.ts` & `yt-dlp` Android+Web client |
| **16kHz MP3 Compression** | Audio stream resampling to keep multi-hour podcast audio under 25MB Groq API limit. | `ffmpeg -ac 1 -ar 16000 -b:a 16k` |
| **Speech-to-Text Transcription** | Word-timestamped transcript generation for precision subtitle placement. | `groq.audio.transcriptions.create` (Whisper Large v3) |
| **AI Viral Hook Scoring** | Natural language analysis of speech flow, topic shifts, and retention hooks with SparkScore (0-100). | Groq Llama-3.3-70B structured JSON prompt |
| **9:16 Vertical Auto-Framing** | Centered active-speaker 9:16 crop formatting for mobile short feeds. | FFmpeg filter `crop=ih*9/16:ih:(iw-ow)/2:0` |
| **Dynamic ASS Subtitle Engine** | Animated word-by-word captions with customizable highlight colors, strokes, and font weights. | Advanced Substation Alpha (`.ass`) rendering |
| **Brand Kit Customizer** | Save custom brand fonts, text cases, stroke colors, highlight colors, and logo overlays. | `app/(app)/brand-kit/page.tsx` & Supabase `brand_kits` |
| **Semantic AI Search** | Search across video library transcripts by intent or topic (e.g., "geopolitics", "growth hacks"). | `components/SemanticSearch.tsx` & NVIDIA NIM |
| **Command Palette (`Cmd+K`)** | Keyboard-accessible modal for quick navigation, project search, and instant actions. | `components/CommandPalette.tsx` (`cmdk`) |
| **Live Telemetry & Timer** | Real-time progress bar feedback and accurate ETA timer calculations (5-min budget). | `hooks/useProjectProgress.ts` & `components/LiveTimer.tsx` |
| **Multi-Currency Payments** | Stripe and Razorpay checkout for Pro / Agency tiers. | `app/api/payments/stripe` & `app/api/payments/razorpay` |

---

## 4. COMPLETE PAGE & ROUTE BREAKDOWN

### A. Marketing & Public Pages (`app/(marketing)/`)
- **Landing Page ([`app/(marketing)/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/page.tsx))**:
  - Cyberpunk ambient background mesh with floating particle dynamics (`ParticleGrid`).
  - Animated hero section with interactive call-to-action (`Start Clipping Free`).
  - Trust bar & animated counter metrics (`Hours Processed`, `Shorts Created`, `Hook Accuracy`).
  - Feature matrix showcase (`AI Hook Detection`, `Smart Auto-Framing`, `Dynamic Captions`, `B-Roll Injection`).
  - Interactive video demo results section (`DemoResultsSection`).
  - Pricing plan toggle (Monthly / Yearly with 20% discount badge).
  - Testimonial card grid & FAQ accordion.
  - JSON-LD `SoftwareApplication` Schema.org metadata for Google rich search snippets.
- **About Page ([`app/(marketing)/about/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/about/page.tsx))**: Company story, mission, and AI team background.
- **Features Page ([`app/(marketing)/features/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/features/page.tsx))**: Deep dive into AI video pipeline capabilities.
- **Pricing Page ([`app/(marketing)/pricing/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/pricing/page.tsx))**: Starter ($0), Pro ($29/mo), and Agency ($99/mo) plan comparisons.
- **Documentation ([`app/(marketing)/documentation/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/documentation/page.tsx))**: User guide, API reference, and video tutorials.
- **Status Page ([`app/(marketing)/status/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28marketing%29/status/page.tsx))**: System status metrics for Vercel, Supabase, Groq, and Worker Nodes.
- **Legal Pages (`/legal/privacy`, `/legal/terms`, `/legal/cookies`, `/legal/data-processing`)**: Compliance & privacy documentation.

### B. Authentication Pages (`app/login/`)
- **Login / Sign-Up Page ([`app/login/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/login/page.tsx))**:
  - Dual-mode glassmorphic authentication modal (Email + Password sign-in & sign-up).
  - Automated redirect callback handling (`/api/auth/callback`).

### C. SaaS App Shell & Protected Routes (`app/(app)/`)
- **App Layout ([`app/(app)/layout.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/layout.tsx))**:
  - Collapsible sidebar navigation bar with active route highlighting.
  - User profile loader with fallback initials avatar.
  - Credit status badge and Command Palette trigger (`Ctrl+K` / `Cmd+K`).
- **Dashboard ([`app/(app)/dashboard/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/dashboard/page.tsx))**:
  - Quick video URL ingest widget (`IngestForm`).
  - Analytics summary cards (`DashboardMetrics`).
  - Semantic search input (`SemanticSearch`).
  - Live activity ticker (`LiveActivityTicker`).
  - Recent projects grid (`DashboardProjectCard`).
- **Projects Library ([`app/(app)/projects/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/projects/page.tsx))**:
  - Grid & List view toggles.
  - Filter tabs (`All`, `Ready`, `Processing`, `Failed`).
  - Instant project search and sort selector (`Newest`, `Oldest`, `Most Clips`).
- **Project Detail Page ([`app/(app)/project/[id]/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/project/%5Bid%5D/page.tsx))**:
  - Full transcript viewer with word-timestamp highlights.
  - Generated clips list with individual virality score badges and video previews.
- **Clip Editor Studio ([`app/(app)/clips/[id]/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/clips/%5Bid%5D/page.tsx))**:
  - Interactive HTML5 video player with timeline scrubber.
  - Caption style customizer (Cyberpunk Neon, Fire Starter, Minimal Pro, Viral Pink, Green Machine).
  - Aspect ratio switcher (9:16 Vertical, 16:9 Landscape, 1:1 Square).
  - Export and instant MP4 download controls.
- **Brand Kit ([`app/(app)/brand-kit/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/brand-kit/page.tsx))**: Subtitle typography, font size, stroke color, text case, and highlight color presets.
- **Analytics ([`app/(app)/analytics/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/analytics/page.tsx))**: Usage charts and clip engagement stats.
- **Integrations ([`app/(app)/integrations/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/integrations/page.tsx))**: Auto-publishing integrations (YouTube, TikTok, Instagram Reels).
- **Machines ([`app/(app)/machines/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/machines/page.tsx))**: Cloud worker node monitoring.
- **Settings ([`app/(app)/settings/page.tsx`](file:///c:/Users/vrajs/Desktop/Personal/Tech/Clipflow/app/%28app%29/settings/page.tsx))**: User profile, billing subscription, and API key management.

---

## 5. UI COMPONENT LIBRARY INVENTORY

### Application Components (`components/`)
1. **`ClipEditorClient.tsx`**: Full clip studio with timeline trimming, caption style picker, and aspect ratio selector.
2. **`CommandPalette.tsx`**: Global keyboard command menu (`Cmd+K`) for instant navigation and project search.
3. **`DashboardMetrics.tsx`**: Stat cards showing total clips, total projects, average SparkScore, and minutes processed.
4. **`DashboardWidgets.tsx`**: Video ingest form, active processing jobs, and quick shortcuts.
5. **`DashboardChart.tsx`**: Interactive processing analytics chart.
6. **`ProjectLibrary.tsx`**: Searchable project library with filter tabs and sorting.
7. **`SemanticSearch.tsx`**: AI natural language transcript search bar.
8. **`LiveActivityTicker.tsx`**: Real-time ticker showing platform processing events.
9. **`LiveTimer.tsx`**: Elapsed time clock and accurate ETA remaining timer.
10. **`AmbientBackground.tsx`**: Cyberpunk glowing gradient mesh background.
11. **`DemoResultsSection.tsx`**: Interactive landing page video player demo.
12. **`EmptyState.tsx`**: Reusable empty state view with illustration and CTA buttons.
13. **`ProjectDropdown.tsx`**: Options menu for renaming, re-processing, or deleting projects.

### Base UI Components (`components/ui/`)
- `button.tsx`: Buttons with `primary`, `secondary`, `glow`, `cyan`, `purple`, `green`, `pink`, `rainbow`, and `ghost` variants.
- `card.tsx`: Glassmorphic container cards with hover lift and glowing borders.
- `badge.tsx`: Status tags (`Ready`, `Processing`, `Failed`), SparkScore badges, and plan badges.
- `progress.tsx`: Custom animated progress bars with gradient fills.
- `input.tsx`: Stylized dark form input fields with focus glow borders.
- `tabs.tsx`: Accessible tab switcher controls.
- `avatar.tsx`: User avatar displays.

---

## 6. API & SERVER ACTIONS INVENTORY

| API Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| **`/api/ingest`** | `POST` | Validates user quota and creates `project` + `job` rows in Supabase. |
| **`/api/progress/[projectId]`** | `GET` | Polling & SSE stream for real-time stage progress updates. |
| **`/api/clips/[id]/render`** | `POST` | Triggers custom re-render of clip with selected subtitle style. |
| **`/api/search`** | `GET` / `POST` | NVIDIA NIM semantic search across user video transcripts. |
| **`/api/stats`** | `GET` | Global platform metrics for social proof counters (cached 1 hour). |
| **`/api/trends`** | `GET` | Fetches viral trending topics and audio recommendations. |
| **`/api/storage`** | `POST` | Handles file upload signed URLs for Supabase Storage. |
| **`/api/webhooks/stripe`** | `POST` | Listens for Stripe subscription updates and updates user credits. |
| **`/api/webhooks/razorpay`**| `POST` | Listens for Razorpay subscription events. |
| **`/api/auth/callback`** | `GET` | Supabase OAuth & Magic Link confirmation callback handler. |

---

## 7. AI WORKER ENGINE & MEDIA PIPELINE

The background AI worker engine (`workers/start-all.js`) operates 24/7 on Hugging Face / cloud worker servers. It orchestrates three dedicated workers:

```
┌────────────────────────────────────────────────────────┐
│               workers/start-all.js                     │
└───────────┬──────────────── border ────────────────────┘
            │
            ├─► workers/transcribe.worker.ts (Stage 1)
            │   - Downloads audio with yt-dlp
            │   - Resamples to 16kHz MP3 via FFmpeg
            │   - Transcribes via Groq Whisper Large v3 Turbo
            │   - Saves word-timestamp transcript to Supabase
            │
            ├─► workers/analyze.worker.ts (Stage 2)
            │   - Fetches transcript from Supabase
            │   - Prompts Groq Llama-3.3-70B for viral hooks
            │   - Calculates SparkScores & subtitle captions
            │   - Inserts clips & queues render jobs in Supabase
            │
            └─► workers/render.worker.ts (Stage 3)
                - Slices video segment using FFmpeg
                - Applies 9:16 crop filter (crop=ih*9/16:ih:(iw-ow)/2:0)
                - Burns animated ASS subtitles
                - Uploads final MP4 to Supabase Storage ('clips' bucket)
```

---

## 8. DATABASE SCHEMA & STORAGE ARCHITECTURE

### Key Database Tables in Supabase PostgreSQL:
1. **`projects`**:
   - `id` (UUID), `user_id` (UUID), `source_url` (TEXT), `duration_sec` (INT)
   - `transcript_text` (TEXT), `transcript_json` (JSONB)
   - `status` (`queued`, `ingesting`, `downloading`, `transcribing`, `analyzing`, `ready`, `failed`)
   - `created_at` (TIMESTAMP)
2. **`jobs`**:
   - `id` (UUID), `project_id` (UUID), `type` (`transcribe`, `analyze`, `render`)
   - `status` (`queued`, `processing`, `done`, `failed`), `progress_pct` (INT), `error_msg` (TEXT)
3. **`clips`**:
   - `id` (UUID), `project_id` (UUID), `user_id` (UUID), `title` (TEXT)
   - `start_time` (FLOAT), `end_time` (FLOAT), `duration_sec` (INT)
   - `spark_score` (INT), `explanation` (TEXT), `hook_text` (TEXT)
   - `captions_json` (JSONB), `output_url` (TEXT), `status` (`queued`, `completed`, `failed`)
4. **`brand_kits`**:
   - `user_id` (UUID), `primary_font` (TEXT), `highlight_color` (TEXT), `text_color` (TEXT), `stroke_color` (TEXT)

---

## 9. DEVOPS & CLOUD INFRASTRUCTURE

- **Frontend Deployment**: Deployed on **Vercel** ([`https://clipflow-omega.vercel.app`](https://clipflow-omega.vercel.app)).
- **Backend Worker Engine**: Deployed 24/7 on **Hugging Face Spaces** ([`ku2407u702/clipflow-worker`](https://huggingface.co/spaces/ku2407u702/clipflow-worker)).
- **Database & Storage**: Hosted on **Supabase Cloud** (`https://xeumlhqpyueneqpkvefx.supabase.co`).
- **Source Code Repository**: Hosted on **GitHub** ([`https://github.com/vrajsavanii/clipflow`](https://github.com/vrajsavanii/clipflow)).

---

*Report compiled and verified for Clipflow AI SaaS production release.*

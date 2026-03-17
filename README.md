# Bhargava's Portfolio: The Ubuntu Experience 🐧

Welcome to my interactive portfolio! This project is designed to simulate a highly responsive **Linux Ubuntu desktop environment** directly within the browser ecosystem. It replaces traditional static scrolling pages with a full-fledged window management system to showcase my skills in advanced web architectures, physics-based interactions, and immersive UI/UX design.

## 🌟 General Features

Explore my portfolio exactly as you would navigate a real desktop operating system:

* **🪟 Interactive Window Management:** A custom-built windowing system allows you to open, drag, resize, maximize, minimize, and close application windows seamlessly. An embedded physics and boundary engine ensures windows remain locked within the safe desktop coordinates while preserving per-window Z-index stacking order via a max-derived focus counter that guarantees newly opened windows always appear in front.
* **🖥️ Authentic Desktop Environment:** Complete with an intuitive app Dock, interactive draggable desktop icons, right-click context menus, and flawlessly crafted UI components that rigidly echo the Ubuntu design language.
* **⏱️ Live System Top Bar:** Features a real-time ticking clock, a functional calendar dropdown built with day-picking date-math algorithms, and a sleek Quick Settings control center housing simulated volume and brightness sliders.
* **💻 3-Stage Bootloader Sequence:** Start the experience with an authentic Linux GRUB terminal boot trace, cascading progress animations, and a blurred Profile Lock Screen before authenticating into the Desktop. Critical assets like `/photos.webp` are preloaded via `<link rel="preload">` during boot for instant desktop responsiveness.
* **📂 Root File System Navigation:** Browse through distinct "apps" and "folders" representing my Projects, Skills, Experience, and Certifications via an intuitive File Explorer interface powered by structured breadcrumb pathing.
* **🏅 Certifications File Manager:** A dedicated file-system UI groups certifications by issuing organization — organizations with multiple certs render as openable folders, single-cert organizations render as file icons. Each certificate image opens in an independent viewer window with concurrent multi-window support (up to 20 simultaneous windows).

---

## 🏗️ Technical Documentation

This project diverges significantly from standard portfolio sites, opting instead for a complex web-application architecture that balances intensive client-side interactivity with server-generated performance metrics.

### 🧠 Architectural Logic & Implemented Ideas

#### 1. Hybrid Rendering Pipeline (Static + Live)

To ensure the application runs at 60fps globally with zero database latency, it relies on a **Decoupled Backend Sync Architecture**.

```mermaid
graph TD
    A[Supabase PostgreSQL] -->|npm run sync / node.js script| B[JSON Serialization]
    B -->|Writes payload| C[public/data/portfolio.json]
    C -->|Zero-latency O1 fetch| D[Next.js App Router Server Components]
    D -->|Statically Injects| E[Client Desktop View]
```

Instead of fetching from the database inside React components on every page load, a custom Node.js build script (`scripts/syncPortfolio.ts`) is executed ahead-of-time. It connects to the Supabase PostgreSQL database, aggregates all tables (Profile, Projects, Skills, Education, etc.), recursively serializes the entire relational map, and statically compiles it into pure `.json` payloads (`public/data/portfolio.json`).

* **Why?** The Next.js frontend strictly consumes static JSON, guaranteeing `O(1)` fetch times, zero database connection limits, and robust fallback resilience. The portfolio acts as a pure View-Controller while the database serves only as an isolated headless CMS.

#### 2. The Window Manager (`<WindowProvider>`)

The heart of the OS is the global `WindowContext`. Rather than managing individual states per component, the architecture uses a centralized React Context that maintains a canonical array of `Window` definitions. All context actions are stabilized with `useCallback` and the provider value is memoized via `useMemo` to prevent cascading re-renders across consumers.

* **Z-Index Stacking:** Each `WindowData` carries its own `zIndex: number` field. When a window is focused (`setActiveWindow`), it receives the next value from a monotonically-increasing counter. New windows derive their z-index from `Math.max()` across all existing windows, guaranteeing they always render on top regardless of prior focus-promotion history.
* **Render Isolation:** Individual `Window` and `WindowFrame` components are wrapped in `React.memo`, preventing re-renders when unrelated windows change state. The `Dock` uses a pre-computed `Set<string>` for O(1) open-window lookups and `useMemo` for dock item derivation.
* **Resource Guarding:** A hard cap of 20 concurrent windows prevents memory exhaustion. Window stagger positions cycle via modular arithmetic (`offset % 10`) to avoid viewport overflow. Click debouncing (500ms ref guard) prevents double-click events from spawning duplicate `allowMultiple` windows.
* **Concurrent Certificate Viewers:** Certificate image windows use `allowMultiple: true` with unique IDs (`cert-viewer-{random9}`). Each open viewer pushes a `/photos.webp` icon to the Dock sidebar for process-level visibility. Clicking a dock icon brings that specific viewer to the front.

#### 3. Hydration-Aware Boot Sequence

The boot sequence introduces a `sibling overlay` architectural trick. Instead of wrapping the heavy React Desktop components *inside* the bootloader (which would cascade rendering delays), the `BootOverlay` operates purely visually *above* the Desktop. This relies entirely on inline CSS `animation-delay` mappings triggered securely on layout shift, protecting the Time-To-First-Byte (TTFB) while masking the React hydration cycle occurring silently underneath.

### 📚 Technical Stack & Library Rationale

The tech stack strictly embraces a highly modular paradigm:

| Library | Version | Architecture Rationale |
| :--- | :---: | :--- |
| **Next.js** | `16.0.3` | The core framework utilizing the App Router. Selected for its aggressive optimization capabilities (Server Components) and its foundational environment for our static data pipeline. |
| **React** | `19.2.0` | The view rendering engine. Leveraging React 19 concurrent features enabling our intensive `WindowProvider` updates to trigger without dropping visual callback frames. |
| **Tailwind CSS** | `^4.0.0` | The utility-first styling matrix. Upgraded to V4 to employ native cascade variables and high-performance inline CSS animations (used extensively in the pure-CSS bootloader), bypassing JS framerate bottlenecks entirely for raw styles. |
| **Motion** (Framer) | `12.23.25` | The physics animation engine. Handles the complex spring mathematics required to animate window opening, closing, and dock minimization smoothly based on arbitrary viewport sizes. |
| **React-RND** | `^10.5.2` | The draggable/resizable substrate sandbox. It inherently encapsulates pointer event delegation, bounding box collisions, and resize handles, which are otherwise highly expensive to implement cross-browser manually. |
| **Supabase Client** | `^2.98.0` | Provides the decoupled remote connection logic executed during the `npm run sync` build steps to serialize remote POSTGRES data securely. |
| **Lucide React** | `^0.555.0` | Vector UI icons cleanly matched to the Ubuntu Yaru aesthetic, retaining crisp boundaries regardless of desktop DPI scaling. |
| **Sentry** | `^10.42.0` | Production error monitoring and performance tracing. Integrated via `@sentry/nextjs` with source maps disabled in production for security. |
| **Serwist** | `^9.5.6` | Service worker tooling for Progressive Web App (PWA) support, enabling offline caching and faster repeat visits. |

---

### 🏛️ Architecture Hardening & Performance Optimization

The portfolio employs an **industry-grade hardened architecture** separating data from presentation, implementing session-scoped caching, non-blocking bootloader prefetching, and secure asset delivery.

#### 1. Application Startup Pipeline

The bootloader doesn't just animate — it orchestrates the entire data initialization sequence.

```mermaid
flowchart TD
    A["App Start"] --> B["Bootloader Mount"]
    B --> C["Hydration Check"]
    C -->|Session cached| D["Skip to Lock Screen"]
    C -->|Fresh session| P["Preload /photos.webp\n(link rel=preload, fetchpriority=high)"]
    P --> E["Fetch portfolio.json"]
    P --> F["Fetch ui_config.json"]
    E --> G["Promise.all Resolution"]
    F --> G
    G --> H["Preload Critical Images\n(Profile, Banner)"]
    H --> I["Complete Boot → Lock Screen"]
    D --> J["Background Prefetch\nportfolio.json + ui_config.json"]
    I --> K["User Clicks ENTER DESKTOP"]
    J --> K
    K --> L["Render Desktop UI"]

    style A fill:#E95420,color:#fff
    style L fill:#77216F,color:#fff
    style G fill:#2C001E,color:#fff
    style P fill:#3ECF8E,color:#fff
```

#### 2. Data & Presentation Separation

`portfolio.json` remains the **pure data layer** generated by the sync script. `ui_config.json` serves as the **presentation rules layer**. They are merged strictly **in memory at runtime**.

```mermaid
flowchart LR
    subgraph "Data Layer (Generated)"
        A["Supabase PostgreSQL"] -->|npm run sync| B["portfolio.json\n(skills, projects, socials...)"]
    end

    subgraph "Presentation Layer (Static)"
        C["ui_config.json\n(icons, colors, layouts)"]
    end

    subgraph "Runtime Merge (In-Memory)"
        B --> D["Component Mount"]
        C --> D
        D --> E["Dynamic Tile Structures"]
        E --> F["SkillsContent"]
        E --> G["SocialsContent"]
        E --> H["ProjectsContent"]
    end

    style A fill:#3ECF8E,color:#fff
    style D fill:#E95420,color:#fff
```

#### 3. Image Loading Pipeline

All images follow a strict CDN-optimized pipeline with universal fallback protection. Both `buildSupabaseImageUrl()` and `resolveImagePath()` enforce the required `/public/` segment in Supabase Storage URLs, preventing 504 timeouts from malformed paths.

```mermaid
flowchart TD
    A["Image Request"] --> B{"Source Type?"}
    B -->|Absolute URL| C["Direct Fetch"]
    B -->|Relative Path| D["Construct Supabase CDN URL\n(enforces /public/ segment)"]
    C --> E["Next.js Image Optimizer"]
    D --> E
    E --> F{"Load Success?"}
    F -->|Yes| G["Render with object-contain\nCentered + Dark Gray Fill"]
    F -->|No| H["/linux-placeholder.webp\nUniversal Fallback"]
    H --> G

    style H fill:#1E1E1E,color:#fff,stroke:#E95420
    style G fill:#2C2C2C,color:#fff
```

All image rendering paths implement fallback logic:

| Component | Fallback Mechanism |
| :--- | :--- |
| `ImageWithFallback` | `onError` → `/linux-placeholder.webp` |
| `AboutContent` (avatar/banner) | Inherits `ImageWithFallback` fallback; explicit placeholder branch |
| `ProjectsContent` | Inherits `ImageWithFallback` fallback |
| `SocialsContent` | Inherits `ImageWithFallback` fallback; SVG icon branch |
| `BlogsContent` | `onError` state → `BookOpen` icon placeholder |
| `CertificationsContent` (viewer) | `onError` → `/linux-placeholder.webp` + error message |

#### 4. Resume Forced Download Pipeline

Browsers override `download` attributes for CDN-hosted PDFs. The system uses a Blob-based workaround.

```mermaid
sequenceDiagram
    participant U as User
    participant D as Desktop.tsx
    participant S as Supabase CDN
    participant B as Browser

    U->>D: Click Resume Icon
    D->>D: Resolve resume_path from profile
    D->>S: fetch(resumeUrl, { mode: 'cors' })
    S-->>D: PDF Response Stream
    D->>D: Convert to Blob
    D->>D: Create ObjectURL
    D->>B: Programmatic link.click()
    B-->>U: Force Download "Bhargava_Resume.pdf"
    D->>D: Revoke ObjectURL (cleanup)
```

#### 5. Session Cache & Request Deduplication

The caching layer prevents redundant network calls across components while scoped strictly to the browser session.

```mermaid
flowchart TD
    subgraph "Session Promise Cache"
        A["portfolioPromise\n(module-scoped)"] 
        B["uiConfigPromise\n(module-scoped)"]
    end

    C["BootLoader"] -->|getPortfolioData| A
    D["SkillsContent"] -->|getPortfolioData| A
    E["SocialsContent"] -->|getPortfolioData| A
    F["AboutContent"] -->|getPortfolioData| A

    C -->|getUiConfigData| B
    D -->|getUiConfigData| B
    E -->|getUiConfigData| B

    A -->|Single fetch| G["portfolio.json"]
    B -->|Single fetch| H["ui_config.json"]

    style A fill:#E95420,color:#fff
    style B fill:#77216F,color:#fff
```

| Cache Layer | Storage | Lifetime | Reset Trigger |
| :--- | :--- | :--- | :--- |
| Portfolio JSON | Module-scoped Promise | Page session | Page refresh |
| UI Config | Module-scoped Promise | Page session | Page refresh |
| Image Assets | Browser HTTP Cache | Browser policy | Cache expiry |
| Critical Images | Preloaded in Bootloader | Page session | Page refresh |

#### 6. Certifications File-System Architecture

The `CertificationsContent` window implements a file-manager metaphor with dynamic grouping and concurrent image viewing.

```mermaid
flowchart TD
    A["portfolio.json\n(certifications array)"] --> B["useMemo Grouping\nO(n) Map by issuing_organization"]
    B --> C{"Organization\nCert Count?"}
    C -->|"> 1"| D["Render Folder Icon\n(org name + badge count)"]
    C -->|"= 1"| E["Render File Icon\n(/photos.webp thumbnail)"]
    D -->|Click| F["Nested Grid View\n(certs inside org)"]
    F --> G["Cert File Icons"]
    E -->|Click| H["openCertificateViewer()"]
    G -->|Click| H
    H --> I["500ms Debounce Guard"]
    I --> J["openWindow()\nallowMultiple: true"]
    J --> K["New Window\ncert-viewer-{random9}"]
    K --> L["Dock Icon\n/photos.webp pushed"]

    style B fill:#E95420,color:#fff
    style J fill:#77216F,color:#fff
    style I fill:#2C001E,color:#fff
```

| Feature | Implementation |
| :--- | :--- |
| Grouping Algorithm | `useMemo` + `Map<org, CertNode[]>` — O(n) single-pass |
| Layout | CSS Grid `repeat(auto-fill, minmax(100px, 1fr))` |
| Overflow Protection | `overflow-y-auto` + custom Ubuntu-orange scrollbar |
| Concurrent Windows | `allowMultiple: true` with unique `cert-viewer-{id}` |
| Double-Click Guard | Ref-based 500ms debounce prevents duplicate popups |
| Image Fallback | `onError` → `/linux-placeholder.webp` + error message |
| Dock Integration | `/photos.webp` icon per open viewer; click to focus |

#### 7. Security Posture

| Check | Status | Details |
| :--- | :---: | :--- |
| `dangerouslySetInnerHTML` | ✅ Safe | Only used for static CSS injection in `layout.tsx` — no user input flows into it |
| DOM Injection | ✅ Protected | React JSX prevents raw HTML insertion; terminal uses `escapeHtml()` defense-in-depth |
| Environment Variables | ✅ Secured | `.gitignore` blocks all `.env*` files; Supabase keys are server-only (no `NEXT_PUBLIC_` prefix for service role) |
| API Authentication | ✅ Protected | `/api/sync` requires `Authorization: Bearer <SYNC_API_SECRET>` header with 60s rate limiting |
| Security Headers | ✅ Hardened | `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `HSTS`, `Referrer-Policy`, `Permissions-Policy` |
| Contact Form | ✅ Rate Limited | 30s cooldown between submissions; input length limits enforced (name: 100, email: 254, message: 2000) |
| Terminal Input | ✅ Sandboxed | No `eval()`/`Function()` — all commands dispatched via static registry; command history capped at 200 entries |
| Window Resources | ✅ Bounded | Maximum 20 concurrent windows; terminal output buffer capped at 500 lines with DOM virtualized to 120 |
| Dependency Audit | ✅ Lean | Unused shadcn/ui components and ~30 dead dependencies removed; only essential packages retained |
| Resume Download | ✅ Domain-locked | Fetch restricted to configured Supabase domain |

---

### 🚀 Getting Started

#### Prerequisites

* Node.js 20+
* npm

#### Installation

```bash
git clone <repo-url>
cd my-portfolio
npm install
```

#### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Scope | Description |
| :--- | :---: | :--- |
| `NEXT_PUBLIC_EMAILJS_SERVICE_ID` | Client | EmailJS service ID for the contact form |
| `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` | Client | EmailJS template ID |
| `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` | Client | EmailJS public key |
| `SYNC_API_SECRET` | Server | Secret token for authenticating `POST /api/sync` requests. Generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_SUPABASE_URL` | Server | Supabase project URL (used by sync script) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Server | Supabase anon/service key (used by sync script) |

#### Development

```bash
npm run dev
```

#### Production Build

```bash
npm run build
npm start
```

#### Data Sync

To sync portfolio data from Supabase to static JSON:

```bash
npm run sync
```

Or via the API (requires `SYNC_API_SECRET`):

```bash
curl -X POST https://your-domain.com/api/sync \
  -H "Authorization: Bearer YOUR_SYNC_API_SECRET"
```

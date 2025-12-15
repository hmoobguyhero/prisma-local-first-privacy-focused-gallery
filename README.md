# Prisma Gallery

[![[cloudflarebutton]]](https://workers.cloudflare.com)

Prisma is a sophisticated, privacy-centric web-based image gallery that acts as a 'zero-upload' hosting solution. Instead of uploading gigabytes of photos to a server, Prisma runs entirely in the user's browser, leveraging the modern File System Access API to mount a local directory directly into the web interface. This fulfills the 'pick and retain' requirement by serializing directory handles to IndexedDB, allowing users to rapidly resume viewing their libraries upon return (subject to browser permission verification).

A stunning, private, local-first photo gallery that turns your local folder into a professional hosted-like portfolio without uploading files.

## ✨ Key Features

- **Virtual File System Layer**: Abstraction over the File System Access API to read folders, generate thumbnails, and parse metadata on the fly without network latency.
- **High-Performance Gallery**: A virtualized masonry/justified grid layout capable of handling thousands of images smoothly.
- **Rich Metadata Inspector**: Automatic extraction and display of EXIF data (Camera, ISO, F-stop, GPS).
- **Immersive Lightbox**: A beautiful, gesture-friendly image viewer with zoom, pan, and slide capabilities.
- **Durable Settings Sync**: Persists user preferences (sort order, theme, layout density) and 'Favorites' metadata.
- **Privacy-First**: All files stay on your device – no uploads, no servers.
- **Responsive & Beautiful**: Modern UI with smooth animations, dark theme support, and flawless mobile experience.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, Framer Motion, TanStack Query
- **UI Libraries**: lucide-react (icons), react-photo-album (gallery), yet-another-react-lightbox (lightbox), date-fns (dates)
- **State & Storage**: Zustand, idb-keyval (IndexedDB), exifr (EXIF parsing)
- **Backend**: Cloudflare Workers, Hono, Durable Objects (preferences sync)
- **Dev Tools**: Bun, ESLint, Prettier

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for deployment (`bun add -g wrangler`)

### Installation

```bash
git clone <your-repo-url>
cd prisma-gallery
bun install
```

### Local Development

```bash
bun dev
```

Opens at `http://localhost:3000`. The dev server supports hot-reload and works in browsers supporting File System Access API (Chrome/Edge 86+, Safari 15.2+).

### Build for Production

```bash
bun build
```

## 📱 Usage

1. **Open the app** in a supported browser.
2. **Pick a folder**: Click "Open Photo Library" and select your images directory.
3. **Browse**: Scroll through thumbnails in a responsive justified grid.
4. **View details**: Click any image to open the lightbox with EXIF sidebar.
5. **Resume sessions**: Reload to auto-resume from saved handle (re-grant permissions if prompted).

**Views**:
- **Library View**: Main photo grid with sorting/filtering toolbar.
- **Onboarding**: Welcome screen explaining privacy model.
- **Lightbox**: Full-screen viewer with metadata inspector.

**Browser Support Note**: File System Access API is Chrome/Edge/Safari only. Firefox uses legacy `<input webkitdirectory>` (non-persistent).

## 🔧 Development

### Project Structure

```
├── src/              # React app (pages, components, hooks)
├── worker/           # Cloudflare Worker + Durable Object
├── shared/           # Shared types
└── public/           # Static assets
```

### Adding Features

- **Frontend**: Add routes in `src/main.tsx`, components in `src/components/`.
- **API Routes**: Extend `worker/userRoutes.ts` using Durable Object patterns in `worker/durableObject.ts`.
- **Types**: Update `shared/types.ts` for type safety.

### Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun build` | Build for production |
| `bun lint` | Lint code |
| `bun preview` | Preview production build |
| `bun deploy` | Build + deploy to Cloudflare |

### Environment Variables

No required env vars. Cloudflare bindings auto-configured.

## ☁️ Deployment

Deploy to Cloudflare Workers with Pages in one command:

```bash
wrangler login
bun deploy
```

Or use the [Deploy to Cloudflare](https://developers.cloudflare.com/workers/get-started/quickstarts/#deploy-with-the-cloudflare-dashboard) button:

[![[cloudflarebutton]]](https://workers.cloudflare.com)

**Custom Domain**: Set `workers_dev: false` and add DNS in `wrangler.jsonc`.

**Production Checklist**:
- Verify File System API support message for unsupported browsers.
- Test IndexedDB persistence across sessions.
- Monitor Durable Object storage usage.

## 🤝 Contributing

1. Fork the repo.
2. Create a feature branch (`bun dev`).
3. Commit changes (`bun lint`).
4. Open a PR.

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with ❤️ using Cloudflare Workers, shadcn/ui, and modern web APIs.
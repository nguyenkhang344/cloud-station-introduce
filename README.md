# Interactive 3D Portfolio

A modern, immersive 3D web portfolio built with Next.js and React Three Fiber. This portfolio showcases skills through an interactive 3D experience featuring a virtual kitchen/home scene with animations, sound management, and responsive design.

## Features

- 🎮 **Interactive 3D Scene** - Navigate through a beautifully rendered 3D environment using mouse/touch controls
- 🎨 **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- 🔊 **Sound Management** - Toggle background music and sound effects with persistent preferences
- ✨ **Smooth Animations** - GSAP and React Spring animations for fluid interactions
- 📱 **Touch Support** - Full touch gesture support for mobile and tablet users
- 🌐 **Multi-Route Portfolio** - Different portfolio sections (main scene + cloud station)
- ⚡ **Performance Optimized** - Efficient 3D rendering with proper asset loading

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 15.5.6** | React framework with App Router |
| **React Three Fiber** | React renderer for Three.js |
| **Three.js** | 3D graphics library |
| **React Three Drei** | Useful helpers for R3F |
| **Tailwind CSS** | Utility-first CSS framework |
| **DaisyUI** | Tailwind CSS component library |
| **GSAP** | Animation library |
| **React Spring** | Physics-based animation library |
| **TypeScript 5.2.2** | Type-safe JavaScript |
| **pnpm** | Fast, disk space efficient package manager |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd introduce

# Install dependencies with pnpm
pnpm install

# Or with npm
npm install
```

### Development

```bash
# Start development server
pnpm dev

# Open http://localhost:3000 in your browser
```

### Building for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server (http://localhost:3000)

# Building and deployment
pnpm build            # Build for production
pnpm start            # Start production server

# Code quality
pnpm lint             # Run Next.js linter
pnpm prettier         # Format all files with Prettier
pnpm prettier:check   # Check formatting without changing files

# Database (if needed)
pnpm seed             # Run database seed script
```

## Project Structure

```
app/
├── page.tsx                    # Home page - main 3D canvas
├── layout.tsx                  # Root layout with metadata
├── layout-client.tsx           # Client-side layout wrapper
├── cloud-station/              # Secondary portfolio section
│   └── page.tsx               # Cloud station page
├── ui/                         # React components
│   ├── models/                # 3D models (Kitchen, Sky, Plane, Fish, etc.)
│   │   ├── Kitchen.tsx        # Main interactive 3D model
│   │   ├── Sky.tsx            # Background environment
│   │   ├── Plane.tsx          # Animated plane
│   │   ├── Fish.tsx           # Fish animation
│   │   └── CloudStation.tsx   # Cloud scene
│   └── common/                # UI overlays and controls
│       ├── HomeInfo.tsx       # Portfolio information display
│       ├── InstructionOverlay.tsx  # User guidance hints
│       ├── LoadingScreen.tsx  # Loading state
│       ├── BlurOverlay.tsx    # Blur effect
│       └── SoundToggle.tsx    # Audio control
├── lib/                        # Utilities and helpers
│   ├── contexts/              # React Context (SoundContext)
│   ├── hooks/                 # Custom hooks (useTouchDevice)
│   └── utils.ts               # Utility functions
└── public/                     # Static assets
    ├── for-public-page/       # GLB 3D models
    │   ├── kitchen.glb        # Main kitchen model
    │   └── ...                # Other 3D models
    └── sounds/                # Audio files
        ├── background-music.mp3
        └── ...                # Sound effects
```

## Key Features Explained

### 3D Scene Management

The main scene in `page.tsx` handles:
- **Canvas Setup** - React Three Fiber canvas with custom configurations
- **Scene State** - Tracks user interactions, rotation, and current stage
- **Responsive 3D** - Automatically adjusts 3D positioning based on screen size
- **Lighting** - Directional, ambient, and hemisphere lights for realistic rendering

### Kitchen Component

The interactive 3D model (`ui/models/Kitchen.tsx`):
- Responds to mouse drag and touch gestures for rotation
- Supports keyboard controls
- Includes friction/damping for smooth deceleration
- Detects interaction hotspots to update displayed content
- Reports loading status to parent component

### UI System

#### HomeInfo
- Displays content based on current portfolio section (`currentStage`)
- Automatically updates when user rotates to different parts

#### InstructionOverlay
- Shows helpful hints on first load
- Disappears after first user interaction

#### LoadingScreen
- Full-screen loader while 3D assets load
- Dismisses when 3D model is ready

#### SoundToggle
- Toggle background music on/off
- Preference saved to localStorage

### Sound Management

- Global `SoundContext` for audio state
- Route-aware music (`RouteAwareMusic` component)
- Different audio for different portfolio sections
- Persistent user preferences

## Responsive Design

The portfolio is optimized for all screen sizes:

| Screen Size | Layout | Scale |
|-----------|--------|-------|
| Mobile (<768px) | Vertical stack | 0.7x |
| Tablet (768px-1024px) | Responsive layout | 0.85x |
| Desktop (>1024px) | Full layout | 1x |

The 3D scene automatically adjusts positioning, scale, and rotation based on viewport width.

## Development Tips

### Working with 3D Models

- 3D models are in GLTF binary format (.glb)
- Use [gltfjsx](https://github.com/pmndrs/gltfjsx) to generate React components from .glb files
- Models are loaded from `/public/for-public-page/`

### Debugging 3D Scene

- Use [Three.js DevTools](https://github.com/threejs/three.js/tree/dev/editor) browser extension
- Inspect 3D objects, lights, and cameras in the browser DevTools
- Check Console for any loading errors

### Customizing Animations

- **GSAP** - For timeline-based, complex animations
- **React Spring** - For physics-based, interactive animations
- Both are pre-configured and ready to use

### Touch Event Handling

- Custom `touchmove` listener prevents unwanted page scrolling
- Kitchen component differentiates between keyboard and pointer input
- Mobile layout uses reduced scale for better performance

### Sound and Music

- Background music path: `/public/sounds/`
- Sound preference saved in localStorage as `soundEnabled`
- Access sound context with `useSoundContext()` hook

### Global UI Triggers

- Use `window.__showBlurOverlay()` to trigger blur effect from anywhere in the app
- Set up in `page.tsx` useEffect

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android latest

## Performance Optimization

- Code splitting with Next.js dynamic imports
- Lazy loading of 3D models
- Optimized asset loading with proper caching
- Efficient re-renders with React.memo and useCallback
- Three.js rendering optimizations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## Credits

### 3D Assets

- **Kitchen Model** - "Cozy Day" by [Omar Faruq Tawsif](https://skfb.ly/ozyVH) is licensed under [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Plane Model** - "Stylized WW1 Plane" by [AntijnvanderGun](https://skfb.ly/6ZFnM) is licensed under [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Cloud Station Model** - "Cloud Station" by [Alexa Kruckenberg](https://skfb.ly/o6UQQ) is licensed under [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Sky Model** - "FREE - SkyBox Anime Sky" by [Paul](https://skfb.ly/oIINu) is licensed under [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/)
- **Cloud Model** - "Cloud" by [KiwiBiwii](https://skfb.ly/prUGn) is licensed under [Creative Commons Attribution 4.0](http://creativecommons.org/licenses/by/4.0/)

## Contact & Social

- 🌐 Visit the live portfolio
- 💼 [LinkedIn](https://www.linkedin.com/in/nguyenvuongkhang)
- 🐙 [GitHub](https://github.com/nguyenkhang344)
- 📧 Email: nguyenkhang344@gmail.com

---

**Built with ❤️ using Next.js, React Three Fiber, and TypeScript**

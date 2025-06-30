# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the frontend client code in this repository.

## Project Overview

This is the **frontend client** for a personal blog project. The overall project is a full-stack application with:
- **Backend**: Django REST Framework (located in `../server/`)
- **Frontend**: React Router v7 with SSR (this directory)

The frontend is built as a modern React application using React Router v7 with server-side rendering capabilities, designed to consume the Django REST API for blog functionality.

## Tech Stack

### Core Technologies
- **React 19** - UI library
- **React Router v7** - Full-stack React framework with SSR
- **TypeScript** - Type safety and development experience
- **Vite** - Build tool and development server
- **TailwindCSS v4** - Utility-first CSS framework
- **Node.js 20** - Runtime environment
- **PNPM** - Package manager (preferred over npm/yarn)

### Key Features
- Server-side rendering (SSR) enabled by default
- Hot Module Replacement (HMR) for development
- TypeScript by default
- Dark/light mode support via CSS
- Production-ready Docker containerization
- Modern ES2022 modules

## Development Commands

### Package Management
```bash
# Install dependencies (uses pnpm)
pnpm install

# Add new dependencies
pnpm add <package>
pnpm add -D <package>  # for dev dependencies
```

### Development
```bash
# Start development server with HMR
pnpm run dev
# Server runs at http://localhost:5173

# Type checking
pnpm run typecheck

# Build for production
pnpm run build

# Start production server
pnpm run start
```

### Docker
```bash
# Build Docker image
docker build -t client .

# Run container
docker run -p 3000:3000 client
```

## Project Structure

```
/client/
├── app/                    # React Router app directory
│   ├── app.css            # Global styles (TailwindCSS)
│   ├── root.tsx           # Root layout component
│   ├── routes.ts          # Route configuration
│   ├── routes/            # Route components
│   │   └── home.tsx       # Home page route
│   └── welcome/           # Welcome page components
│       ├── logo-dark.svg
│       ├── logo-light.svg
│       └── welcome.tsx
├── public/                # Static assets
│   └── favicon.ico
├── node_modules/          # Dependencies
├── package.json           # Package configuration
├── pnpm-lock.yaml        # Lock file
├── react-router.config.ts # React Router configuration
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── Dockerfile            # Multi-stage Docker build
└── README.md             # Project documentation
```

## Architecture Details

### React Router v7 Structure
- **SSR Enabled**: Server-side rendering is enabled by default
- **File-based Routing**: Routes defined in `app/routes.ts` with components in `app/routes/`
- **Layout System**: `root.tsx` provides the main layout with error boundaries
- **Type Safety**: Full TypeScript integration with route-specific types

### Styling
- **TailwindCSS v4**: Latest version with new configuration system
- **Dark Mode**: Automatic dark/light mode support via CSS `prefers-color-scheme`
- **Inter Font**: Google Fonts integration for typography
- **Responsive Design**: Mobile-first approach

### Build System
- **Vite**: Fast development and optimized production builds
- **TypeScript Paths**: `~/*` alias maps to `./app/*`
- **Module Resolution**: Bundler-style resolution for modern imports
- **Production Optimization**: Asset bundling and optimization included

## Current Implementation Status

### Completed Features
- ✅ Basic React Router v7 setup with SSR
- ✅ TailwindCSS v4 integration
- ✅ TypeScript configuration
- ✅ Docker containerization
- ✅ Development environment setup
- ✅ Error boundary implementation
- ✅ Dark/light mode support

### Ready for Blog Integration
The current setup is a fresh React Router template. The next development phase should focus on:

1. **API Integration**: Connect to Django REST API (`../server/`)
2. **Blog Components**: Create components for posts, comments, tags
3. **Routing**: Add blog-specific routes (post detail, tag filtering, etc.)
4. **State Management**: Add state management if needed for complex interactions
5. **SEO**: Leverage SSR for SEO optimization

## Integration with Backend

The Django REST API (located in `../server/`) provides:
- Blog posts with slug-based URLs
- Anonymous commenting system
- Tag-based filtering
- View tracking
- API documentation at `/api/docs/`

Key API endpoints to integrate:
- `GET /api/posts/` - List blog posts
- `GET /api/posts/slug/{slug}/` - Get post by slug with view tracking
- `GET /api/posts/{id}/comments/` - Get post comments
- `POST /api/posts/{id}/comments/` - Create comment

## Development Guidelines

### Code Style
- Use TypeScript for all new files
- Follow React Router v7 conventions
- Use TailwindCSS utility classes
- Maintain responsive design principles
- Implement proper error boundaries

### File Organization
- Route components in `app/routes/`
- Shared components in appropriate subdirectories
- Use TypeScript path aliases (`~/` for app directory)
- Keep static assets in `public/`

### Environment Configuration
- Development: Uses Vite dev server on port 5173
- Production: Built assets served via React Router's server
- Docker: Multi-stage build for optimized production image

## Important Notes

- **Package Manager**: Prefer `pnpm` over `npm` (lock file is pnpm-lock.yaml)
- **SSR**: Server-side rendering is enabled and should be leveraged for SEO
- **TypeScript**: Strict mode enabled - maintain type safety
- **Build Output**: Production build creates both client and server bundles
- **Deployment Ready**: Docker configuration supports various platforms (AWS ECS, Google Cloud Run, etc.)

## Next Steps for Blog Implementation

1. **Install HTTP Client**: Add axios or fetch wrapper for API calls
2. **Create Blog Layout**: Design header, navigation, footer components  
3. **Post Components**: Create post list, post detail, and comment components
4. **Routing**: Add routes for blog functionality (posts, tags, search)
5. **Data Fetching**: Implement server-side data loading with React Router loaders
6. **Error Handling**: Add proper error states for API failures
7. **SEO Optimization**: Use React Router's meta functions for dynamic SEO tags
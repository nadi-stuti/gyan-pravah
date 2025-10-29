# Next.js Configuration

## 📋 Configuration Overview

The Next.js configuration in `next.config.ts` is carefully crafted to optimize the application for performance, development experience, and integration with external services.

## 🔧 Configuration Breakdown

### Core Configuration

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true, // Fast dev experience
  },
  // ... other configurations
};
```

### Experimental Features

#### Turbopack File System Cache
```typescript
experimental: {
  turbopackFileSystemCacheForDev: true,
}
```

**What it does:**
- Enables file system caching for Turbopack in development
- Dramatically speeds up subsequent development server starts
- Caches compiled modules between development sessions

**Why it's important:**
- **Faster development** - Reduces cold start time from ~30s to ~3s
- **Better developer experience** - Less waiting, more coding
- **Incremental builds** - Only recompiles changed files

**When to use:**
- Always enabled for development
- Automatically disabled in production builds

### Image Configuration

```typescript
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
      port: "1337",
      pathname: "/uploads/**",
    },
  ],
},
```

**Purpose:**
- Allows Next.js Image component to optimize images from Strapi CMS
- Strapi typically runs on `localhost:1337` in development
- `/uploads/**` is Strapi's default upload directory

**Security considerations:**
- Only allows images from trusted Strapi instance
- Pattern matching prevents unauthorized image sources
- Should be updated for production Strapi URL

**Production setup:**
```typescript
// For production, add your Strapi domain
images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "your-strapi-domain.com",
      pathname: "/uploads/**",
    },
    // Keep localhost for development
    {
      protocol: "http",
      hostname: "localhost",
      port: "1337", 
      pathname: "/uploads/**",
    },
  ],
},
```

### PostHog Analytics Rewrites

```typescript
async rewrites() {
  return [
    {
      source: "/ingest/static/:path*",
      destination: "https://us-assets.i.posthog.com/static/:path*",
    },
    {
      source: "/ingest/:path*", 
      destination: "https://us.i.posthog.com/:path*",
    },
  ];
},
```

**What this does:**
- Proxies PostHog analytics requests through your domain
- Prevents ad blockers from blocking analytics
- Improves analytics data collection reliability

**How it works:**
1. PostHog client sends requests to `/ingest/*`
2. Next.js rewrites these to PostHog's actual endpoints
3. Requests appear to come from your domain
4. Ad blockers are less likely to block same-origin requests

**Benefits:**
- **Higher data collection rate** - Bypasses most ad blockers
- **Better analytics accuracy** - More complete user behavior data
- **GDPR compliance** - Data flows through your domain first

### Trailing Slash Configuration

```typescript
skipTrailingSlashRedirect: true,
```

**Purpose:**
- Required for PostHog API requests
- PostHog endpoints expect specific URL formats
- Prevents Next.js from automatically redirecting trailing slashes

**Technical details:**
- Next.js normally redirects `/path/` to `/path` or vice versa
- PostHog API has specific expectations about URL format
- This setting disables automatic redirects

## 📦 Package.json Scripts

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "eslint",
    "clean": "rm -rf .next"
  }
}
```

#### Script Breakdown

**`npm run dev`**
- Starts development server with hot reloading
- Enables Turbopack for faster builds
- Runs on `http://localhost:3000` by default

**`npm run build`**
- Creates optimized production build
- Generates static files and server-side code
- Performs type checking and linting
- Outputs to `.next` directory

**`npm run start`**
- Starts production server
- Requires `npm run build` to be run first
- Serves optimized production build

**`npm run lint`**
- Runs ESLint on the codebase
- Uses Next.js ESLint configuration
- Checks for code quality and consistency

**`npm run clean`**
- Removes `.next` build directory
- Useful for troubleshooting build issues
- Forces complete rebuild on next `dev` or `build`

## 🔍 TypeScript Configuration

### tsconfig.json Key Settings

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Key configurations explained:**

**Path Mapping (`@/*`):**
- Allows imports like `@/components/Button` instead of `../../../components/Button`
- Improves code readability and maintainability
- Makes refactoring easier

**Strict Mode:**
- Enables all strict type checking options
- Catches more potential bugs at compile time
- Enforces better coding practices

**Next.js Plugin:**
- Provides Next.js-specific TypeScript features
- Enables proper typing for App Router
- Adds support for Next.js conventions

## 🎨 Tailwind Configuration

### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      // Custom design system colors would be here
    },
  },
  plugins: [],
};
```

**Content Configuration:**
- Tells Tailwind which files to scan for classes
- Includes all possible locations of components
- Enables proper tree-shaking of unused styles

**Font Configuration:**
- Sets up Poppins font with CSS variables
- Provides fallback to system sans-serif
- Integrates with Next.js font optimization

## 🚀 Performance Optimizations

### Build Optimizations

1. **Turbopack Development:**
   - 10x faster than Webpack in development
   - Incremental compilation
   - Better caching strategies

2. **Image Optimization:**
   - Automatic WebP conversion
   - Responsive image generation
   - Lazy loading by default

3. **Bundle Optimization:**
   - Automatic code splitting
   - Tree shaking of unused code
   - Compression and minification

### Runtime Optimizations

1. **Font Loading:**
   - `display: swap` for better loading experience
   - Preloading of critical fonts
   - Fallback font matching

2. **Analytics Proxying:**
   - Reduced third-party requests
   - Better caching of analytics scripts
   - Improved privacy compliance

## 🔧 Environment-Specific Configurations

### Development vs Production

**Development:**
- Turbopack enabled for faster builds
- Source maps for debugging
- Hot reloading and fast refresh
- Detailed error messages

**Production:**
- Optimized bundles with minification
- Static generation where possible
- Compressed assets
- Error boundaries for graceful failures

### Environment Variables

The app uses environment variables for configuration:

```bash
# .env.local
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Public variables** (prefixed with `NEXT_PUBLIC_`):
- Available in browser and server
- Used for client-side API calls
- Should not contain sensitive information

**Server-only variables:**
- Only available on server side
- Used for sensitive operations
- Not exposed to browser

## 🛠️ Development Workflow

### Recommended Development Process

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Make changes and see instant updates**
   - Hot reloading for React components
   - Fast refresh preserves component state
   - Turbopack provides near-instant builds

3. **Type checking:**
   ```bash
   npm run lint
   ```

4. **Build testing:**
   ```bash
   npm run build
   npm run start
   ```

### Troubleshooting Common Issues

**Slow development server:**
- Run `npm run clean` to clear build cache
- Check if Turbopack is enabled
- Ensure sufficient system memory

**Type errors:**
- Check `tsconfig.json` path mappings
- Verify all dependencies have type definitions
- Run TypeScript compiler directly: `npx tsc --noEmit`

**Build failures:**
- Clear `.next` directory
- Check for circular dependencies
- Verify all imports are correct

This configuration provides a solid foundation for development while optimizing for performance, developer experience, and production deployment.
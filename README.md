# Gyan Pravah - Hindu Knowledge Quiz Platform

A comprehensive quiz platform for Hindu religious and cultural knowledge, built as a pnpm monorepo with Next.js, Strapi CMS, and TypeScript.

## 🏗️ Monorepo Structure

```
gyan-pravah/
├── app/                    # Next.js frontend application
├── cms/                    # Strapi CMS backend
├── scripts/                # Population and utility scripts
├── packages/
│   └── types/             # Shared TypeScript types
└── content/               # Markdown content files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Build shared types
pnpm --filter @gyan-pravah/types run build
```

### Development

```bash
# Start all services in development mode
pnpm dev

# Or start individual services
pnpm --filter app run dev        # Next.js app
pnpm --filter cms run dev        # Strapi CMS
pnpm --filter scripts run dev    # Scripts in watch mode
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter app run build
```

## 📦 Packages

### App (`app/`)
Next.js frontend application with:
- TypeScript support
- Tailwind CSS
- Shared types from `@gyan-pravah/types`
- Path aliases (`@/*`)

### CMS (`cms/`)
Strapi v5 CMS with:
- Quiz Topics, Subtopics, and Questions content types
- SQLite database
- TypeScript support

### Scripts (`scripts/`)
Utility scripts for:
- Populating Strapi with content from markdown files
- Data management and testing
- TypeScript with shared types

### Types (`packages/types/`)
Shared TypeScript definitions for:
- Quiz data structures
- Strapi API responses
- Content management types

## 🔧 Scripts

```bash
# Populate Strapi with quiz data
pnpm populate

# Clear and repopulate Strapi
pnpm populate:clear

# Test population scripts
pnpm --filter scripts run test:populate
```

## 🎯 Key Features

- **Monorepo Architecture**: Organized codebase with shared dependencies
- **Type Safety**: Shared TypeScript types across all packages
- **Content Management**: Markdown-based content with Strapi CMS
- **Automated Population**: Scripts to populate CMS from markdown files
- **Modern Stack**: Next.js 16, Strapi v5, TypeScript 5

## 📝 Content Structure

Quiz content is organized by topics:
- **Nadi** (Holy Rivers) - 15 subtopics
- **Shruti** (Vedic Scriptures) - 15 subtopics  
- **Smriti** (Epics, Laws, Sutras) - 15 subtopics
- **Purana** (Mythology & Theology) - 15 subtopics
- **Stuti** (Hymns & Prayers) - 15 subtopics
- **Bhagvan** (Deities) - 15 subtopics
- **Utsav** (Festivals) - 12 subtopics
- **Dham** (Pilgrimage Sites) - 12 subtopics
- **Sant** (Saints) - 15 subtopics

Total: **129 subtopics** across **9 major topics**

## 🛠️ Development Workflow

1. **Types First**: Define shared types in `packages/types/`
2. **Content Creation**: Add markdown files to `content/questions/`
3. **CMS Population**: Use scripts to populate Strapi
4. **Frontend Development**: Build UI in the Next.js app
5. **Testing**: Use provided test scripts

## 📚 API Endpoints

- `GET /api/quiz-topics` - Get all topics with subtopics
- `GET /api/quiz-subtopics?filters[quiz_topic][id]={id}` - Get subtopics by topic
- `GET /api/quiz-questions?filters[quiz_subtopic][id]={id}` - Get questions by subtopic

## 🤝 Contributing

1. Follow the monorepo structure
2. Use shared types from `@gyan-pravah/types`
3. Update types when adding new features
4. Test scripts before committing
5. Follow TypeScript best practices
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

## 🚀 Complete Setup Guide

### Step 1: Install Node.js 22 LTS

**Option A: Using Node Version Manager (Recommended)**
```bash
# Install nvm (Windows - use nvm-windows)
# Download from: https://github.com/coreybutler/nvm-windows/releases

# Install and use Node.js 22 LTS
nvm install 22
nvm use 22

# Verify installation
node --version  # Should show v22.x.x
```

**Option B: Direct Download**
1. Visit [Node.js official website](https://nodejs.org/)
2. Download Node.js 22 LTS (Long Term Support)
3. Run the installer and follow the setup wizard
4. Verify installation: `node --version`

### Step 2: Install pnpm

**Option A: Using npm (comes with Node.js)**
```bash
npm install -g pnpm

# Verify installation
pnpm --version  # Should show 8.x.x or higher
```

**Option B: Using standalone installer**
```bash
# Windows PowerShell
iwr https://get.pnpm.io/install.ps1 -useb | iex

# Or using Chocolatey
choco install pnpm

# Or using Scoop
scoop install pnpm
```

### Step 3: Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/nadi-stuti/gyan-pravah
#to check out the MVP branch
git checkout MVP 
cd gyan-pravah

# Install all dependencies for the monorepo
pnpm install

# Build shared types (required before running other packages)
pnpm --filter @gyan-pravah/types run build
```

### Step 4: Environment Setup

```bash
# Copy environment files
cp app/.env.example app/.env.local
cp cms/.env.example cms/.env
cp scripts/.env.example scripts/.env

# Edit the environment files as needed
# app/.env.local - Configure Next.js environment
# cms/.env - Configure Strapi settings
# scripts/.env - Configure population script settings
```

### Step 5: Start Development Servers

```bash
# Start all services in development mode
pnpm dev

# This will start:
# - Next.js app on http://localhost:3000
# - Strapi CMS on http://localhost:1337
```

**Or start services individually:**
```bash
# Terminal 1: Start Strapi CMS
pnpm --filter cms run dev

# Terminal 2: Start Next.js app
pnpm --filter app run dev
```

### Step 6: Setup Strapi Admin Account

1. Open your browser and go to `http://localhost:1337/admin`
2. Create your first admin account:
   - First Name: Your first name
   - Last Name: Your last name
   - Email: Your email address
   - Password: Strong password (min 8 characters)
3. Click "Let's start" to complete the setup
4. You'll be redirected to the Strapi admin dashboard

### Step 7: Generate Strapi API Token

1. In the Strapi admin dashboard, navigate to **Settings** (gear icon in the left sidebar)
2. Under "Global Settings", click on **API Tokens**
3. Click the **"Create new API Token"** button
4. Configure the token:
   - **Name**: `Next.js App Token` (or any descriptive name)
   - **Description**: `API token for Next.js frontend application`
   - **Token duration**: `Unlimited` (recommended for development)
   - **Token type**: `Full access` (gives complete API access)
5. Click **"Save"** to generate the token
6. **Important**: Copy the generated token immediately (it won't be shown again)
7. Open your `app/.env.local` file and add the token:
   ```bash
   STRAPI_API_TOKEN=your_generated_token_here
   NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
   ```
8. Save the file
9. Open your `scripts/.env` file and add the token:
   ```bash
   STRAPI_API_TOKEN=your_generated_token_here
   STRAPI_URL=http://localhost:1337
   ```
10. Save the file

### Step 8: Populate Strapi with Quiz Data

```bash
# Run the population script to seed Strapi with markdown content
pnpm populate

# If you need to clear existing data and repopulate:
pnpm populate:clear
```

The population script will:
- Read markdown files from the `content/` directory
- Create quiz topics, subtopics, and questions in Strapi
- Display progress and completion status

### Step 9: Verify Data Upload

1. Go to `http://localhost:1337/admin`
2. Login with your admin credentials
3. Navigate to "Content Manager" in the left sidebar
4. Check the following content types:
   - **Quiz Topics** - Should show 9 topics (Nadi, Shruti, Smriti, etc.)
   - **Quiz Subtopics** - Should show 129 subtopics total
   - **Quiz Questions** - Should show all questions from markdown files
5. Click on each content type to verify the data has been imported correctly

### Step 10: Access the Application

1. Open `http://localhost:3000` in your browser
2. The Next.js application should load with quiz data from Strapi
3. Test the quiz functionality to ensure everything is working

## 🔧 Additional Commands

```bash
# Build all packages for production
pnpm build

# Start production servers
pnpm start

# Run linting across all packages
pnpm lint

# Clean build artifacts
pnpm clean

# Test population scripts
pnpm --filter scripts run test:populate
```

## 🚨 Troubleshooting

**Port conflicts:**
- Next.js (3000): Change port with `pnpm --filter app run dev -- -p 3001`
- Strapi (1337): Modify `cms/config/server.ts` to change port

**Database issues:**
- Delete `cms/.tmp/` and `cms/database/` folders, then restart Strapi

**Population script fails:**
- Ensure Strapi is running on `http://localhost:1337`
- Check that admin account is created
- Verify environment variables in `scripts/.env`

**Node version issues:**
- Ensure you're using Node.js 22 LTS: `node --version`
- Use `nvm use 22` if using Node Version Manager

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
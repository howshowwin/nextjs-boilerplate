# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Start**: `npm start`
- **Lint**: `npm run lint`

## Architecture Overview

This is a Next.js 15 (App Router) application serving as an intelligent life assistant with calendar and photo album functionality. The app features Apple-style design with glass morphism effects and integrates Google Drive for photo storage.

### Core Technologies
- **Frontend**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: PostgreSQL via Neon (@neondatabase/serverless)
- **State Management**: Zustand with persistence
- **Icons**: Heroicons
- **AI**: Google Gemini API for photo tagging
- **Storage**: Google Drive API for photo management

### Project Structure

```
app/
├── api/                    # API routes
│   ├── auth/              # NextAuth configuration
│   ├── calendar/          # Calendar CRUD operations
│   ├── photos/            # Photo upload/import/management
│   └── drive/             # Google Drive integration
├── calendar/              # Calendar page
├── photos/                # Photo album page
├── auth/error/           # Authentication error handling
└── [other pages]/        # Various app pages

lib/
├── auth-utils.ts         # Authentication utilities and API wrappers
├── db.ts                 # Neon PostgreSQL connection
├── googleDrive.ts        # Google Drive API integration
├── gemini.ts             # Google Gemini AI integration
└── store/                # Zustand stores

components/               # Reusable UI components
```

## Key Features & Systems

### Authentication System
- Google OAuth with automatic token refresh
- Email allowlist via `ALLOWED_EMAILS` environment variable
- Automatic token refresh 5 minutes before expiration
- Comprehensive error handling for expired tokens

### Database Schema
Uses PostgreSQL with calendar events stored including:
- Event types: task, event, milestone
- Priority levels: high, medium, low
- Completion status and timestamps
- Location and description fields

### Google Drive Integration
- Automatic token refresh mechanism in `lib/googleDrive.ts`
- Photo upload to specified Drive folder
- AI-powered photo tagging via Google Gemini
- Pagination support for large photo collections

## Environment Variables Required

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DRIVE_FOLDER_ID=
POSTGRES_URL=
ALLOWED_EMAILS=          # Comma-separated list (optional)
GEMINI_API_KEY=          # For AI photo tagging
```

## Development Guidelines

### Authentication Flow
- Use `lib/auth-utils.ts` functions for all API calls requiring authentication
- Handle token refresh automatically via `apiRequest()` wrapper
- Check for `X-Token-Refreshed` header to update UI state
- Use `handleAuthError()` for consistent error handling

### Database Operations
- Import `sql` from `lib/db.ts` for database queries
- Use parameterized queries for security
- Handle connection errors gracefully (placeholder function during build)

### API Development
- All API routes should handle token refresh scenarios
- Return appropriate HTTP status codes (401 for auth failures)
- Include `X-Token-Refreshed` header when tokens are updated
- Use `getToken()` from NextAuth for server-side token access

### Component Development
- Follow Apple-style design patterns established in existing components
- Use Heroicons for consistent iconography
- Implement responsive design (mobile-first)
- Utilize Zustand stores for state management

## Testing & Debugging

- Use `/test-auth` page for authentication flow testing
- Monitor console for token refresh logs
- Check `X-Token-Refreshed` headers in network tab
- Verify Google Drive folder permissions and API quotas

## Common Pitfalls

- Don't call `neon()` during build time - use the conditional export in `lib/db.ts`
- Always use `apiRequest()` wrapper for authenticated API calls
- Handle 401 responses by checking for token expiration scenarios
- Ensure Google Drive folder ID has proper sharing permissions
- Remember to add new Google OAuth redirect URIs in Google Cloud Console
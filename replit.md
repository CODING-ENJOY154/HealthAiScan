# AI Health Monitor

## Overview

AI Health Monitor is a full-stack web application that uses artificial intelligence for facial emotion detection and health monitoring. The application provides comprehensive health analytics, vitals tracking, and personalized wellness insights through an intuitive interface.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend components:

- **Frontend**: React + TypeScript SPA with Vite build system
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and session management
- **Styling**: Tailwind CSS with shadcn/ui component library
- **AI Integration**: Client-side face detection using face-api.js

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom health-themed color variables
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Passport.js with local strategy using scrypt for password hashing
- **Session Management**: express-session with PostgreSQL session store
- **API Design**: RESTful endpoints with proper error handling and validation

### Database Schema
The application uses four main tables:
- **users**: Stores user authentication and profile information
- **health_reports**: Contains health scan results including vitals, mood, and wellness scores
- **user_preferences**: Manages user settings like theme and notification preferences
- **health_badges**: Tracks user achievements and milestones

### AI and Health Features
- **Face Detection**: Client-side facial emotion analysis using face-api.js
- **Health Metrics**: Simulated vital signs generation based on detected emotions
- **Wellness Scoring**: Comprehensive health scoring algorithm
- **Report Generation**: PDF export capabilities using jsPDF
- **Voice Assistant**: Text-to-speech for accessibility
- **QR Code Sharing**: Health report sharing via QR codes

## Data Flow

1. **User Authentication**: Users register/login through Passport.js local strategy
2. **Health Scanning**: Frontend captures video, performs face detection, generates health metrics
3. **Data Storage**: Health reports are validated and stored in PostgreSQL via Drizzle ORM
4. **Dashboard Display**: React Query fetches and caches health data for real-time dashboard updates
5. **Report Export**: Client-side PDF generation and QR code creation for sharing

## External Dependencies

### Runtime Dependencies
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **Authentication**: Passport.js ecosystem for secure user authentication
- **AI Libraries**: face-api.js for client-side facial recognition
- **Charting**: Chart.js for health trend visualization
- **Document Generation**: jsPDF for PDF report creation
- **QR Codes**: qrcode library for shareable health summaries

### Development Dependencies
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: ESLint and TypeScript for code validation
- **Database Migrations**: Drizzle Kit for schema management
- **Development Tools**: tsx for TypeScript execution, Replit integration

## Deployment Strategy

The application is configured for deployment on Replit's infrastructure:

- **Development**: Hot module replacement with Vite dev server on port 5000
- **Production**: Built static assets served by Express.js server
- **Database**: Neon PostgreSQL with connection pooling
- **Session Storage**: PostgreSQL-backed session store for scalability
- **Environment**: Node.js 20 with ES modules support

### Build Process
1. Frontend build: `vite build` creates optimized static assets
2. Backend build: `esbuild` bundles server code for production
3. Static serving: Express serves built frontend and handles API routes
4. Database migrations: Drizzle Kit manages schema updates

## Changelog

```
Changelog:
- June 27, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
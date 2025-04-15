# Survista App

## Overview

Survista is a full-stack survey management platform featuring:

* **Frontend:** Next.js (React) with TypeScript, Zustand for state management, Axios for API calls, and Flowbite React, shadcn ui / Tailwind CSS for styling 
* **Backend:** NestJS (Node.js) with TypeScript, PostgreSQL database managed via Prisma, JWT-based authentication (access & refresh tokens), Argon2 for password hashing, and Google OAuth 2.0 integration

## Project Structure

The project is a monorepo containing two main packages:

* `client/`: The Next.js frontend application.
* `server/`: The NestJS backend API.

## Prerequisites

* Node.js (Version compatible with NestJS/Next.js - e.g., >= 18 recommended)
* npm (or yarn/pnpm)
* Docker and Docker Compose (for running the PostgreSQL database)
* Git

## Setup & Installation

1.  **Clone the Repository:**
    ```bash
    git clone
    cd survista-app-main
    ```

2.  **Start Database:**
    * Ensure Docker Desktop (or Docker Engine with Compose) is running.
    * From the root `survista-app-main` directory, start the PostgreSQL container:
        ```bash
        docker-compose up -d
        ```
        This uses the configuration in `docker-compose.yml` 

3.  **Backend Setup (`server/`):**
    * Navigate to the server directory: `cd server`
    * Install dependencies: `npm install` 
    * **Create Environment File:** Create a `.env` file in the `server/` directory. You can copy `.env.example` 
    * **Database Migration:** Apply database schema changes:
        ```bash
        npx prisma migrate dev
        ```

4.  **Frontend Setup (`client/`):**
    * Navigate to the client directory: `cd ../client`
    * Install dependencies: `npm install` 
    * **Create Environment File:** Create a `.env.local` file in the `client/` directory or copy `.env.local.example` 
        

## Running the Application

You need two terminals open:

1.  **Terminal 1 (Backend):**
    ```bash
    cd server
    npm run dev
    ```
    The backend API should be running on `http://localhost:8000`.

2.  **Terminal 2 (Frontend):**
    ```bash
    cd client
    npm run dev
    ```
    The frontend application should be accessible at `http://localhost:3000`.

## API Documentation

The backend API documentation (Swagger UI) is automatically generated and available at `http://localhost:8000/api-docs` when the server is running 

## Current Project Status (Sprint 1 - as of April 14, 2025)

* **Completed Functionality:**
    * Phase 1: Setup & Foundation
    * Phase 2: Backend Core Email/Password Auth
    * Phase 3: Frontend Core Auth UI & State
    * Phase 4: Frontend UI Refinement
    * Phase 5: Backend Auth Protection & State Check (`/me`, `/logout`)
    * Phase 6: Frontend Auth Integration & Route Protection
    * Phase 7: Backend & Frontend Refresh Token Logic
    * Phase 8: Backend & Frontend Google OAuth 2.0
    * Phase 9: Backend & Frontend Password Reset

* **Next Up:**
    * Phase 10: Backend & Frontend - RoleBased Access Control (RBAC) - User CRUD (Admin) 
    
* **Pending:**
    * Phase 11: Backend & Frontend - Profile Management 
    * Phase 12: Final Documentation & Testing


# Authentication Setup Guide

This document provides a complete guide to setting up and testing the authentication system for this application.

---

### 1. Project Structure

The project has been organized to separate database concerns from the UI application.

*   `app/ui/`: Contains the Next.js frontend application.
*   `app/db/`: Contains all database-related files, including:
    *   `prisma/schema.prisma`: The Prisma schema for the database.
    *   `prisma.config.ts`: The Prisma CLI configuration.
*   `app/ui/app/api/auth/`: Contains the NextAuth.js API routes for handling authentication.

Regarding the API structure, all backend logic is currently handled within the Next.js application's API routes (`app/ui/app/api/`). If a separate, standalone API service is desired (as hinted by the `api/api` suggestion), please clarify, and we can adjust the architecture.

---

### 2. Environment Variable Setup

To run the application, you need to set up the following environment variables.

**For Vercel Deployment:**

Go to your project's settings on Vercel and add the following environment variables:

*   `DATABASE_URL`: The **pooled connection string** from your Neon database.
*   `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
*   `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
*   `NEXTAUTH_SECRET`: A secret key for NextAuth.js to sign tokens.

**For Local Development:**

Create a file named `.env` in the `app/ui/` directory and add the following:

```
DATABASE_URL="your_neon_pooled_connection_string"  # required at runtime by PrismaClient
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
NEXTAUTH_SECRET="your_generated_secret"
ADMIN_EMAILS="abdoulaye.sow.1989@gmail.com,abdoulaye.sow.co@gmail.com"  # bootstrap initial admins (comma-separated)
# Recommended in production:
# NEXTAUTH_URL="https://yourdomain.com"
```

**How to Get The Values:**

*   **`DATABASE_URL`**: You have already set this up from your Neon project dashboard.
*   **`GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`**:
    1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
    2.  Create a new project.
    3.  Go to "APIs & Services" -> "Credentials".
    4.  Create an "OAuth client ID" for a "Web application".
    5.  Add `http://localhost:8000` to "Authorized JavaScript origins".
    6.  Add `http://localhost:8000/api/auth/callback/google` to "Authorized redirect URIs".

    **Production (Vercel):** also add your deployed URL (Vercel domain or custom domain) to both lists, e.g.
    - JavaScript origin: `https://YOUR-VERCEL-DOMAIN.vercel.app`
    - Redirect URI: `https://YOUR-VERCEL-DOMAIN.vercel.app/api/auth/callback/google`
    7.  Copy the Client ID and Client Secret.
*   **`NEXTAUTH_SECRET`**:
    *   Run the following command in your terminal to generate a secure secret:
        ```bash
        openssl rand -hex 32
        ```
    *   Copy the output and use it as the value for `NEXTAUTH_SECRET`.

---

### 3. First-Time Setup and Running the App

1.  **Install Dependencies:**
    *   Navigate to the `app/ui/` directory and run:
        ```bash
        npm install
        ```

2.  **Sync Database Schema:**
    *   Run the following command from the root of the project to apply the schema to your Neon database:
        ```bash
        npx prisma db push --config=app/db/prisma.config.ts
        npm --prefix app/ui run prisma:generate
        ```

3.  **Start the Development Server:**
    *   Navigate to the `app/ui/` directory and run:
        ```bash
        npm run dev
        ```
    *   The application will be available at `http://localhost:8000`.

---

### 4. How to Test Authentication

**4.1. Google Login**

*   After completing the environment variable setup, navigate to `http://localhost:8000`.
*   You should be automatically redirected to the `/login` page.
*   Click the "Sign in with Google" button and follow the prompts.
*   Upon successful login, you will be redirected to the dashboard.

**4.2. Credentials (Email/Password) Login**

To test this, you first need to create a user in the database with a hashed password.

1.  **Create a User:**
    *   Users **cannot self-register**.

To create/invite users for testing, use the **director-only** admin endpoint:
- **Endpoint:** `http://localhost:8000/api/admin/users`
- **Method:** `POST`
- **Body (JSON) examples:**

Invite-only (Google sign-in after invite):
```json
{ "email": "teacher1@example.com", "role": "teacher", "status": "invited" }
```

Credentials user (email/password login):
```json
{ "email": "staff1@example.com", "role": "teacher", "password": "your-strong-password" }
```

2.  **Log In:**
    *   Once the user is created, go to the `/login` page.
    *   Enter the email and password you just used.
    *   Click "Sign in with Credentials".
    *   You should be redirected to the dashboard.

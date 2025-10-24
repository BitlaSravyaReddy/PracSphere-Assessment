# Task Manager Application

A full-stack task management application built with Next.js, MongoDB, and NextAuth. This application allows users to create, organize, and track tasks using a Kanban board interface with support for subtasks, drag-and-drop functionality, and real-time progress tracking.


## Features

- User authentication with email/password and Google OAuth
- Email verification with OTP codes
- **AI-powered Smart Task Creation**: Create tasks and subtasks from natural language input (see details below)
- **AI Smart Insights Generator**: Get personalized productivity insights and motivational tips based on your task completion patterns (see details below)
- Kanban board with three columns: Pending, In Progress, and Completed
- Drag and drop tasks between columns
- Create tasks with title, description, and due date
- Add subtasks with optional times
- Track task progress with visual indicators
- Overdue task detection and alerts
- User profile management with avatar upload
- Password change and account deletion
- Dark/light theme support
- Responsive design for mobile and desktop
- Zod Validation for forms


---

## AI Smart Task Creation

**Smart Task Creation** lets you describe your task in plain English, and the AI will automatically extract the title, due date, and any subtasks. Example prompts:

- "Submit project report by Friday with introduction, analysis, and conclusion"
- "Buy groceries tomorrow: milk, bread, eggs"
- "Prepare for meeting: 1. Review notes 2. Update slides 3. Print handouts"

**How it works:**
- The AI parses your input and fills out the task form for you.
- If required details (like due date) are missing, you'll see a warning and can edit or confirm before creating the task.
- Subtasks are automatically detected from lists, keywords, or multiple actions in your prompt.

**Benefits:**
- Save time by creating complex, multi-step tasks in one step
- No need to manually break down tasks into subtasks
- Ensures all required details are captured before saving

---

## AI Smart Insights Generator

The **AI Smart Insights Generator** analyzes your task completion patterns and provides personalized productivity insights and motivational tips.

**Features:**
- Tracks when you complete the most tasks (morning, afternoon, evening, night)
- Calculates your completion rate and average tasks per day
- Generates motivational messages and productivity tips using AI
- Updates insights in real time as you complete tasks

**How to use:**
- Insights are shown at the top of your dashboard
- Click "Refresh" to get new AI-generated insights based on your latest activity

**Benefits:**
- Stay motivated with personalized feedback
- Discover your most productive times
- Get actionable tips to improve your workflow

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js with Credentials and Google providers
- **AI Integration**: Google Gemini API for natural language task parsing
- **Email**: Nodemailer for OTP verification emails
- **Validation**: Zod for form validation
- **Styling**: Tailwind CSS modules and inline styles with CSS variables
- **Build Tool**: Turbopack
- **Package Manager**: pnpm
- **Monorepo**: Turborepo

## Prerequisites

Before setting up the project, make sure you have the following installed:

- Node.js version 18 or higher
- pnpm version 9.0.0 or higher
- MongoDB database (local installation or MongoDB Atlas account)
- Google Cloud Console project for OAuth (optional, only if using Google login)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd my-turborepo
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the entire monorepo, including the web app and shared packages.

### 3. Set Up Environment Variables

Create a `.env.local` file in the `apps/web` directory:

```bash
cd apps/web
touch .env.local
```

Add the following environment variables to the `.env.local` file:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/taskmanager
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Google OAuth (Optional - only if using Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Gemini AI API Key (Required for Smart Task Creation)
GEMINI_API_KEY=your-gemini-api-key-here

# Email Configuration (for OTP verification)
SMTP_USER='your-email'
SMTP_PASS='smtp_password'
SMTP_FROM_NAME='app_name'
```

### 4. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and use it as the value for `NEXTAUTH_SECRET` in your `.env.local` file.

### 5. Set Up MongoDB

**Option A: Local MongoDB**

1. Install MongoDB on your machine
2. Start the MongoDB service
3. Use `MONGODB_URI=mongodb://localhost:27017/taskmanager` in your `.env.local`

**Option B: MongoDB Atlas (Cloud)**

1. Create a free account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Create a database user with a password
4. Get your connection string from the Atlas dashboard
5. Replace the connection string in your `.env.local` file

### 6. Set Up Email for OTP Verification

For Gmail:

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Security > 2-Step Verification > App passwords
   - Generate a password for "Mail"
   - Use this password as `EMAIL_PASS` in your `.env.local`

For other email providers, configure SMTP settings accordingly.

### 7. Set Up Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure the consent screen
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env.local` file

### 8. Set Up Gemini AI API (Required for Smart Task Creation)

To enable the AI-powered natural language task creation feature:

1. Go to Google AI Studio at https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file as `GEMINI_API_KEY`

Without this API key, the Smart Task Creation feature will not work, but all other features will function normally.

## Running the Application

### Development Mode

To start the development server:

```bash
cd apps/web
pnpm dev
```

This will start:
- Web app on http://localhost:3000
- Hot reload enabled with Turbopack

The application will automatically open in your browser at http://localhost:3000

### Production Build

To create a production build:

```bash
# From the root directory
pnpm build
```

To run the production build:

```bash
cd apps/web
pnpm start
```

## Project Structure

```
my-turborepo/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/                # Next.js app directory
│       │   ├── api/            # API routes
│       │   ├── dashboard/      # Dashboard page
│       │   ├── login/          # Login page
│       │   ├── profile/        # Profile page
│       │   ├── signup/         # Signup page
│       │   ├── verify/         # Email verification page
│       │   └── types/          # TypeScript types
│       ├── components/         # React components
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # Utility functions
│       ├── models/             # Mongoose models
│       └── public/             # Static assets
├── packages/
│   ├── eslint-config/          # Shared ESLint configuration
│   ├── typescript-config/      # Shared TypeScript configuration
│   └── ui/                     # Shared UI components
├── turbo.json                  # Turborepo configuration
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── README.md                   # This documentation file
```

## Usage Guide

### First Time Setup

1. Start the application with `pnpm dev`
2. Navigate to http://localhost:3000
3. Click on "Sign Up" to create a new account
4. Enter your name, email, and password
5. Check your email for the OTP verification code
6. Enter the OTP code on the verification page
7. After verification, you will be redirected to the login page
8. Log in with your credentials

### Creating Tasks

**Method 1: Smart Task Creation (AI-Powered)**

1. From the dashboard, find the "Smart Task Creation" section at the top
2. Type your task in plain English in the input box, such as:
   - "Submit project report by Friday"
   - "Complete UI design tomorrow afternoon"
   - "Meeting with team on 25th October"
   - "Review code next Monday"
3. Click "Create with AI" or press Enter
4. The AI will extract the task details (title, description, due date, status)
5. Review the auto-filled form in the task creation modal
6. Make any adjustments if needed and click "Create Task"

**Method 2: Manual Task Creation**

1. From the dashboard, click the "New Task" button
2. Enter the task title, description, and due date
3. Select the initial status (Pending, In Progress, or Completed)
4. Click "Create Task"

### Managing Subtasks

1. Click on a task card to open the task details
2. Click "Add Subtask" button
3. Enter the subtask title
4. Optionally add a due date and time for the subtask
5. Click "Add" to create the subtask
6. Check the checkbox to mark a subtask as completed

### Using the Kanban Board

1. Drag tasks between columns to change their status
2. Tasks with incomplete subtasks cannot be moved to the Completed column
3. When you add subtasks to a completed task, the status automatically changes based on subtask completion

### Profile Management

1. Click on your profile from the sidebar
2. Upload a profile picture by clicking the avatar
3. Edit your name in the Profile tab
4. Change your password in the Security tab
5. Delete your account in the Account tab (this action is permanent)

## Troubleshooting

### Database Connection Issues

If you see "Failed to connect to MongoDB":
- Check that MongoDB is running
- Verify your `MONGODB_URI` in `.env.local`
- Make sure your IP address is whitelisted in MongoDB Atlas (if using Atlas)

### Email Not Sending

If OTP emails are not being sent:
- Verify your email credentials in `.env.local`
- Check that 2-factor authentication is enabled for Gmail
- Make sure you are using an App Password, not your regular password
- Check your spam folder

### Google OAuth Not Working

If Google sign-in fails:
- Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- Check that the redirect URI in Google Console matches exactly
- Make sure Google+ API is enabled in your project

### Smart Task Creation Not Working

If the AI-powered task creation fails:
- Verify your `GEMINI_API_KEY` is correctly set in `.env.local`
- Make sure you have an active internet connection
- Check that your Gemini API key is valid and has not exceeded quota limits
- Try restarting the development server after adding the API key
- Check the browser console for any specific error messages

### Port Already in Use

If port 3000 is already in use:
- Kill the process using port 3000, or
- Change the port in `apps/web/package.json` dev script

### Build Errors

If you encounter build errors:
- Delete `node_modules` and `.next` directories
- Run `pnpm install` again
- Clear the Turbo cache: `rm -rf .turbo`

## Important Notes

- The application requires an active internet connection for Google OAuth and AI-powered features
- Smart Task Creation requires a valid Gemini API key from Google AI Studio
- Email verification is mandatory for credential-based authentication
- All passwords are hashed using bcrypt before storage
- Sessions are managed using JWT tokens
- The application uses MongoDB change streams for real-time updates (requires MongoDB replica set)

## Security Considerations

- Never commit your `.env.local` file to version control
- Rotate your `NEXTAUTH_SECRET` regularly
- Use strong passwords for database users
- Enable 2-factor authentication on all accounts
- Keep dependencies up to date
- Review MongoDB Atlas security settings regularly




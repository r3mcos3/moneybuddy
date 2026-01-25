# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MoneyBuddy is a personal finance and budgeting web application inspired by Dyme. The goal is to help users track their spending, manage budgets, and gain insights into their financial habits.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite (fast development server and optimized builds)
- **Styling**: Tailwind CSS (with dark mode support via class strategy)
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions, storage)
- **Deployment**: TBD

## Core Features

**Implemented:**
- ✅ User authentication (login, signup, password reset)
- ✅ Dark mode support with localStorage persistence
- ✅ Protected routes
- ✅ Dashboard layout with header and stat cards

**Planned:**
- Budget creation and tracking (budget vs actuals)
- Transaction management and categorization
- Financial insights and analytics
- Real-time sync via Supabase
- Recurring transactions, savings goals, spending trends

## Supabase Architecture

### Database Schema
Tables (see `/supabase/migrations/` for SQL):
- `profiles` - User profiles (extends auth.users with full_name, avatar_url, currency)
- `categories` - Transaction categories (income/expense) with color and icon
- `accounts` - Bank accounts or wallets (checking, savings, credit, cash)
- `transactions` - Individual financial transactions
- `budgets` - Budget definitions with periods (weekly/monthly/yearly) and limits

All tables have RLS enabled. Default categories are auto-created for new users.

### Authentication
Use Supabase Auth for user authentication and authorization. Row Level Security (RLS) policies should be enabled on all tables to ensure users can only access their own data.

### Real-time Features
Leverage Supabase real-time subscriptions for live updates to transactions and budgets.

## Development Guidelines

### Supabase Setup
1. Create a Supabase project at https://supabase.com
2. Configure environment variables for Supabase URL and anon key
3. Set up Row Level Security policies for all tables
4. Use Supabase client libraries for database operations

### Database Migrations
Use Supabase migrations to manage schema changes. All DDL changes should be tracked as migrations.

### Security
- Enable RLS on all tables
- Never expose service role key in frontend code
- Validate all user inputs
- Use Supabase Auth for authentication flows

## Development Commands

### Running the App
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Create production build (runs TypeScript check + Vite build)
- `npm run preview` - Preview production build locally
- `npm run lint` - Run TypeScript type checking without emitting files

### Environment Setup
1. Copy `.env.example` to `.env`
2. Add Supabase credentials from your project settings
3. Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Project Structure

```
src/
├── components/
│   ├── auth/           # Login, Signup components
│   ├── layout/         # Header, StatCard, shared layout components
│   ├── Dashboard.tsx   # Main dashboard view
│   └── ProtectedRoute.tsx  # Route protection wrapper
├── contexts/
│   └── AuthContext.tsx # Auth state management with Supabase
├── hooks/
│   └── useLocalStorage.ts  # localStorage hook for dark mode
├── lib/
│   └── supabase.ts     # Supabase client initialization
├── types/
│   └── database.types.ts   # TypeScript types for database tables
├── App.tsx             # Main app with AuthProvider and routing
├── main.tsx            # Entry point
└── index.css           # Tailwind directives and global styles

supabase/
├── migrations/         # Database migrations (initial schema + seed data)
└── README.md           # Supabase setup instructions
```

## Code Conventions

### TypeScript
- Strict mode enabled
- All components and functions should be typed
- Use interfaces for object types (defined in `src/types/`)
- Database types are in `src/types/database.types.ts`

### React
- Functional components with hooks
- Use TypeScript `.tsx` extension
- Props should be typed with interfaces
- Use custom hooks for reusable logic (e.g., useLocalStorage, useAuth)
- Context API for global state (AuthContext)

### Styling
- Tailwind CSS utility classes
- Dark mode via `class` strategy (toggle with `dark` class on root element)
- Responsive design with mobile-first approach

### Supabase Client
- Import from `src/lib/supabase.ts`
- Never expose service role key in frontend
- Use typed queries with database types

## Authentication Flow

The app uses Supabase Auth with the following flow:
1. User lands on Login or Signup page
2. `AuthContext` manages user state and provides auth methods
3. On successful auth, user profile is auto-created via database trigger
4. Default categories (14 income/expense categories) are auto-seeded
5. Authenticated users see the Dashboard
6. `ProtectedRoute` component guards protected pages

Auth methods available via `useAuth()` hook:
- `signUp(email, password, fullName)` - Create new account
- `signIn(email, password)` - Login
- `signOut()` - Logout
- `resetPassword(email)` - Send password reset email
- `user` - Current user object
- `session` - Current session
- `loading` - Auth loading state

## Features

### ✅ Completed Features

**Authentication & User Management**
- Email/password authentication with Supabase Auth
- Login, signup, and password reset flows
- Auto-created user profiles with default categories
- Protected routes
- Session persistence

**Dashboard**
- Total balance overview across all accounts
- Quick access cards to all features
- Recent transactions display (last 5)
- Dark mode toggle with localStorage persistence

**Accounts Management** (`/accounts`)
- Create, read, update, delete accounts
- 4 account types: checking, savings, credit, cash
- Multi-currency support (EUR, USD, GBP)
- Real-time balance tracking
- Unique gradient cards per account type

**Transactions Management** (`/transactions`)
- Add income and expense transactions
- Edit and delete with account balance sync
- Category selection from default categories
- Account selection
- Date picker for transaction date
- Advanced filtering (by account, category, type)
- Summary cards showing total income, expenses, and net
- Grouped display by date
- Real-time balance updates

**Recurring Transactions** (`/recurring`)
- Create recurring income and expenses (vaste lasten)
- Frequency options: weekly, every 4 weeks, monthly, yearly
- Manual processing with one-click batch creation
- Active/inactive status toggle
- Automatic next due date calculation
- Visual indicators for due transactions
- Edit and delete recurring transactions

**Analytics** (`/analytics`)
- Total income, expenses, and transaction count overview
- Last 7 days spending chart (bar chart)
- Top spending categories with percentages
- Spending by account breakdown
- Visual progress bars and charts

**General**
- Fully responsive design (mobile, tablet, desktop)
- Dark mode support throughout
- Clean, modern UI with Tailwind CSS
- Real-time data sync with Supabase
- Row Level Security (RLS) on all tables

## Custom Hooks

- `useAuth()` - Authentication state and methods
- `useAccounts()` - Account CRUD operations
- `useTransactions()` - Transaction CRUD with balance updates
- `useCategories()` - Category management
- `useRecurringTransactions()` - Recurring transaction management and processing
- `useLocalStorage()` - Persistent state (dark mode)

The `/inspiration/` folder contains UI/UX reference images from Dyme app showing desired features and design direction.

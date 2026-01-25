# Supabase Database Setup

This folder contains the database schema and migrations for MoneyBuddy.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready

### 2. Get Your Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - `anon` public key
3. Add these to your `.env` file in the project root:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. Run Migrations

You have two options to run the migrations:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the sidebar
3. Create a new query
4. Copy and paste the contents of `migrations/20260125000000_initial_schema.sql`
5. Click "Run" to execute
6. Repeat for `migrations/20260125000001_seed_default_categories.sql`

#### Option B: Using Supabase CLI (Recommended for development)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations to your project:
   ```bash
   supabase db push
   ```

### 4. Verify Setup

1. Go to the "Table Editor" in your Supabase dashboard
2. You should see the following tables:
   - `profiles`
   - `categories`
   - `accounts`
   - `transactions`
   - `budgets`

3. Row Level Security (RLS) should be enabled on all tables

## Database Schema

### Tables

- **profiles**: User profiles (extends Supabase auth.users)
- **categories**: Transaction categories (income/expense)
- **accounts**: Bank accounts or wallets
- **transactions**: Individual financial transactions
- **budgets**: Budget definitions with periods and limits

### Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Auto-updated timestamps**: `updated_at` fields are automatically updated
- **Auto-created profile**: When a user signs up, a profile is automatically created
- **Default categories**: New users get a set of default income and expense categories

## Making Schema Changes

When making changes to the database schema:

1. Create a new migration file in `supabase/migrations/`
2. Name it with timestamp: `YYYYMMDDHHMMSS_description.sql`
3. Write your SQL changes
4. Test locally if using Supabase CLI
5. Apply to production using one of the methods above

## Generating TypeScript Types

To generate TypeScript types from your database schema:

```bash
supabase gen types typescript --linked > src/types/database.types.ts
```

This will override the manually created types with auto-generated ones based on your actual schema.

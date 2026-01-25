# MoneyBuddy

Personal finance and budgeting web application to help you track spending, manage budgets, and gain insights into your financial habits.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with dark mode support
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (create one at [supabase.com](https://supabase.com))

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your Supabase credentials to `.env`:
   - Go to your Supabase project settings
   - Copy the project URL and anon key
   - Update the `.env` file with your values

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

### Type Checking

Run TypeScript type checking:
```bash
npm run lint
```

## 🛠️ Developer Tools

MoneyBuddy includes built-in dev tools for testing and demo purposes:

1. **Access Dev Tools**: Look for the purple "🛠️ Dev Tools" button in the bottom-right corner of the app
2. **Seed Mock Data**: Click "🌱 Seed Mock Data" to instantly populate your account with:
   - 4 accounts (checking, savings, credit, cash)
   - ~100 realistic transactions (last 30 days)
   - 6 budgets for common categories
3. **Clear All Data**: Click "🗑️ Clear All Data" to remove all seeded data (keeps profile & categories)

Perfect for:
- Testing all features without manual data entry
- Viewing analytics with realistic data
- Demo presentations
- Development and testing

## Features

### ✅ Fully Implemented

- 🔐 **Authentication** - Secure login, signup, password reset
- 🏦 **Account Management** - Multiple accounts (checking, savings, credit, cash)
- 💰 **Transaction Tracking** - Income/expense with categories, filtering, search
- 🔄 **Recurring Transactions** - Vaste lasten en regelmatig inkomen (weekly, every 4 weeks, monthly, yearly)
- 📈 **Analytics** - Spending insights, charts, category breakdowns
- 🌓 **Dark Mode** - Full dark mode support with persistence
- 🔄 **Real-time Sync** - Automatic data sync via Supabase
- 📱 **Responsive Design** - Works on mobile, tablet, and desktop
- 💱 **Multi-Currency** - Support for EUR, USD, GBP

### 📋 Default Categories

**Expenses:** Groceries 🛒, Restaurants 🍽️, Transportation 🚗, Shopping 🛍️, Entertainment 🎬, Utilities ⚡, Housing 🏠, Healthcare 🏥, Insurance 🛡️, Other 📦, Huur 🏠, Energie ⚡, Internet & TV 📡, Verzekeringen 🛡️, Abonnementen 📱, Brandstof ⛽, Boodschappen 🛒

**Income:** Salary 💰, Freelance 💼, Investments 📈, Other Income 💵

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utilities and Supabase client
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## License

ISC

# Flex Reviews Dashboard

A modern review management dashboard for Flex Living properties, built with Next.js 15, TypeScript, and Supabase.

## Features

- 📊 **Dashboard**: Comprehensive analytics and review management
- ✅ **Review Approval**: Approve, reject, or restrict reviews
- 🔄 **Smart Sync**: Only syncs new or updated reviews using content hashing
- 📈 **Analytics**: Review trends, rating distributions, and category insights
- 🎨 **Modern UI**: Clean, responsive design with Flex Living branding

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flex-reviews-dashboard
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to your project's SQL Editor
3. Run the schema from `scripts/supabase-schema.sql`:
   - This creates the required tables: `listings`, `reviews`, and `review_categories`
   - Sets up proper indexes and Row Level Security policies

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

To find these values:
- Go to your Supabase project settings
- Navigate to API settings
- Copy the Project URL, anon/public key, and service_role key

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
flex-reviews-dashboard/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── ingest/        # Review ingestion endpoint
│   │   └── reviews/       # Review management endpoints
│   ├── dashboard/         # Dashboard page
│   ├── reviews/           # Public reviews page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── reviews/           # Review page components
├── lib/                   # Utility functions and services
│   ├── ingestion-service.ts # Review sync logic with hashing
│   └── types.ts           # TypeScript type definitions
├── fixtures/              # Sample data
│   └── hostaway_reviews.json # Sample review data
└── scripts/               # Database scripts
    └── supabase-schema.sql # Database schema
```

## Key Features Explained

### Smart Review Syncing
- Uses SHA256 content hashing to detect changes
- Only syncs new or modified reviews
- Preserves approval status for existing reviews

### Review Management
- **Pending**: New reviews awaiting approval
- **Approved**: Reviews visible on the public page
- **Restricted**: Hidden reviews that won't appear publicly

### Bulk Operations
- Select multiple reviews for bulk approval/restriction
- Smart filtering prevents invalid operations

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run typecheck # Run TypeScript type checking
```

## Syncing Reviews

1. Navigate to the Dashboard (`/dashboard`)
2. Click "Sync Reviews" button
3. The system will:
   - Check for new reviews in `fixtures/hostaway_reviews.json`
   - Compare content hashes to detect changes
   - Only insert/update changed reviews
   - Display sync results (new, updated, skipped)

## Deployment

The app can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Self-hosted with Node.js

### Environment Variables for Production
Make sure to set the same environment variables in your deployment platform.

## Troubleshooting

### Reviews not showing
- Check if reviews are approved in the dashboard
- Verify Supabase connection in browser console
- Ensure RLS policies are correctly set

### Sync button error
- Verify `content_hash` column exists in the reviews table
- Check Supabase service role key is set correctly
- Review browser console for detailed error messages

### Database Issues
If you see database errors:
1. Ensure all tables exist (run the schema SQL)
2. Check that the `content_hash` column is present
3. Verify API keys are correct

## Support

For issues or questions, please check the browser console for detailed error messages and ensure all environment variables are correctly set.
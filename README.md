# Flex Reviews Dashboard

A comprehensive review management system for vacation rental properties with integrations for Hostaway and Google Reviews.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Supabase account (for database)

## Local Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd flex-reviews-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# External Reviews API (Optional)
REVIEWS_API_SECRET_KEY="your-external-api-key"
```

#### Getting Supabase Credentials:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API
3. Copy the Project URL for `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the Service Role Key for `SUPABASE_SERVICE_ROLE_KEY`

### 4. Database Setup

Run the following SQL migrations in your Supabase SQL editor:

#### Create Reviews Tables

```sql
-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  listing_id INTEGER REFERENCES listings(id),
  type VARCHAR(50),
  overall_rating INTEGER,
  public_review TEXT,
  submitted_at TIMESTAMP,
  guest_name VARCHAR(255),
  source VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  approved BOOLEAN,
  content_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create review categories table
CREATE TABLE IF NOT EXISTS review_categories (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  category VARCHAR(100),
  rating INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create review approvals table
CREATE TABLE IF NOT EXISTS review_approvals (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  is_approved BOOLEAN NOT NULL,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP DEFAULT NOW()
);

-- Create Google reviews table (for external API integration)
CREATE TABLE IF NOT EXISTS google_reviews (
  id SERIAL PRIMARY KEY,
  uid INTEGER,
  pid INTEGER,
  review_id VARCHAR(255) UNIQUE NOT NULL,
  reviewer_profile_photo_url TEXT,
  reviewer_display_name VARCHAR(255),
  star_rating VARCHAR(50),
  rating_value INTEGER,
  create_time TIMESTAMP,
  update_time TIMESTAMP,
  comment TEXT,
  original_comment TEXT,
  reply_comment TEXT,
  original_reply_comment TEXT,
  reply_time TIMESTAMP,
  location_id INTEGER,
  branch_id INTEGER,
  source VARCHAR(100),
  location_title VARCHAR(255),
  fetched_at TIMESTAMP DEFAULT NOW()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
flex-reviews-dashboard/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── google-reviews/    # Google reviews page
│   ├── properties/        # Property listings
│   └── property/[id]/     # Individual property pages
├── components/            # Reusable React components
├── fixtures/             # Mock data for development
├── lib/                  # Utility functions and services
├── migrations/           # Database migrations
└── public/              # Static assets
```

## Features

- **Admin Dashboard**: Comprehensive review management interface
- **Review Sync**: Import reviews from JSON fixtures or external APIs
- **Review Filtering**: Filter by property, rating, and approval status
- **Bulk Actions**: Approve/reject multiple reviews at once
- **Google Reviews Integration**: Fetch and display Google reviews
- **Property Pages**: Individual pages for each property with reviews
- **Analytics**: Review statistics and performance metrics

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

- `GET /api/reviews` - Fetch all reviews
- `POST /api/ingest` - Sync reviews from fixtures
- `POST /api/reviews/[id]/approve` - Approve/reject a review
- `GET /api/reviews/google` - Fetch Google reviews
- `POST /api/reviews/google/fetch` - Sync Google reviews from external API

## Troubleshooting

### Common Issues

1. **Database connection errors**: Verify your Supabase credentials in `.env.local`
2. **Build errors**: Clear Next.js cache with `rm -rf .next` and rebuild
3. **Missing reviews**: Run sync from Admin Dashboard to import fixture data

## License

Private - All rights reserved

-- Updated schema to match exact flow requirements with listings, reviews, and review_categories tables
-- Supabase schema for reviews management following the specified flow
-- Run this in your Supabase SQL editor

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table with exact structure from requirements
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  external_id VARCHAR(255) UNIQUE NOT NULL,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('host-to-guest', 'guest-to-host')),
  status VARCHAR(50) NOT NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 10),
  public_review TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  source VARCHAR(50) DEFAULT 'hostaway',
  approved BOOLEAN DEFAULT false,
  content_hash VARCHAR(64), -- Hash of review content for change detection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create review_categories table
CREATE TABLE IF NOT EXISTS review_categories (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_external_id ON reviews(external_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_content_hash ON reviews(content_hash);
CREATE INDEX IF NOT EXISTS idx_listings_external_id ON listings(external_id);

-- Enable Row Level Security
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT USING (approved = true);

CREATE POLICY "Public can view review categories for approved reviews" ON review_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM reviews 
      WHERE reviews.id = review_categories.review_id 
      AND reviews.approved = true
    )
  );

-- Create Google Reviews table
CREATE TABLE IF NOT EXISTS google_reviews (
    id SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL,
    pid INTEGER,
    review_id VARCHAR(255) UNIQUE NOT NULL, -- Unique constraint to prevent duplicates
    reviewer_profile_photo_url TEXT,
    reviewer_display_name VARCHAR(255),
    star_rating VARCHAR(50),
    rating_value INTEGER, -- Numeric rating (1-5) for easier filtering
    create_time TIMESTAMP WITH TIME ZONE,
    update_time TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    original_comment TEXT,
    reply_comment TEXT,
    original_reply_comment TEXT,
    reply_time TIMESTAMP WITH TIME ZONE,
    location_id INTEGER,
    branch_id INTEGER,
    source VARCHAR(100) DEFAULT 'Google',
    location_title VARCHAR(255),
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_google_reviews_review_id ON google_reviews(review_id);
CREATE INDEX idx_google_reviews_star_rating ON google_reviews(star_rating);
CREATE INDEX idx_google_reviews_rating_value ON google_reviews(rating_value);
CREATE INDEX idx_google_reviews_location_id ON google_reviews(location_id);
CREATE INDEX idx_google_reviews_create_time ON google_reviews(create_time DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_google_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_google_reviews_updated_at_trigger
BEFORE UPDATE ON google_reviews
FOR EACH ROW
EXECUTE FUNCTION update_google_reviews_updated_at();
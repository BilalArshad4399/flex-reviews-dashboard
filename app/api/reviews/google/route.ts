import { NextResponse } from "next/server"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export async function GET() {
  try {
    // Fetch reviews from the database
    const { data: dbReviews, error } = await supabase
      .from('google_reviews')
      .select('*')
      .order('create_time', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: "Failed to fetch reviews from database",
        data: []
      }, { status: 500 })
    }

    // Transform database reviews to match frontend format
    const transformedReviews = dbReviews?.map(review => ({
      id: review.review_id,
      author_name: review.reviewer_display_name,
      author_url: `https://www.google.com/maps/contrib/${review.uid}`,
      rating: review.rating_value || 0,
      relative_time_description: getRelativeTime(review.create_time),
      text: review.comment,
      time: new Date(review.create_time).getTime(),
      profile_photo_url: review.reviewer_profile_photo_url,
      property_name: review.location_title,
      property_address: `Location ${review.location_id}`
    })) || []

    return NextResponse.json({
      success: true,
      data: transformedReviews,
      count: transformedReviews.length,
      source: transformedReviews.length > 0 ? "database" : "empty",
      metadata: {
        fetched_at: new Date().toISOString(),
        properties_count: transformedReviews.length > 0 
          ? [...new Set(transformedReviews.map((r: any) => r.property_name))].length 
          : 0,
        average_rating: transformedReviews.length > 0 
          ? transformedReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / transformedReviews.length
          : 0
      }
    })
  } catch (error) {
    console.error('Error in Google reviews API:', error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Google reviews",
        data: []
      },
      { status: 500 }
    )
  }
}

// POST endpoint to trigger refresh from external API
export async function POST() {
  try {
    // This endpoint is now handled by /api/reviews/google/fetch
    // Redirect the request there
    return NextResponse.json({
      success: true,
      message: "Please use /api/reviews/google/fetch endpoint to fetch new reviews",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to refresh Google reviews"
      },
      { status: 500 }
    )
  }
}
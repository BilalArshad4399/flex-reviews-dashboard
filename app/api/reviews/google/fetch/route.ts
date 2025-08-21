import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const reviewsApiKey = process.env.REVIEWS_API_SECRET_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

interface GoSignReview {
  uid: number
  pid: number
  reviewId: string
  reviewerProfilePhotoUrl?: string
  reviewerDisplayName: string
  starRating: string
  createTime: {
    date: string
    timezone_type: number
    timezone: string
  }
  updateTime: {
    date: string
    timezone_type: number
    timezone: string
  }
  comment: string
  originalComment: string
  replyComment?: string
  originalReplyComment?: string
  replyTime?: {
    date: string
    timezone_type: number
    timezone: string
  } | null
  locationId: number
  branchId: number
  source: string
  locationtitle: string
}

function convertStarRatingToNumber(rating: string): number {
  const ratingMap: { [key: string]: number } = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5
  }
  return ratingMap[rating] || 0
}

function parseDateTime(dateObj: { date: string; timezone_type: number; timezone: string } | null | undefined): string | null {
  if (!dateObj || !dateObj.date) return null
  // Parse the date string and return ISO format
  return new Date(dateObj.date).toISOString()
}

export async function POST(request: NextRequest) {
  try {
    if (!reviewsApiKey || reviewsApiKey === 'your-api-secret-key-here') {
      return NextResponse.json({
        success: false,
        message: 'Reviews API key not configured. Please add REVIEWS_API_SECRET_KEY to your .env file'
      }, { status: 500 })
    }

    // Fetch reviews from external API
    const apiUrl = `https://dashboard.gosign.de/review/api/${reviewsApiKey}/reviews-list.json`
    
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`)
    }

    const reviews: GoSignReview[] = await response.json()
    
    if (!Array.isArray(reviews)) {
      throw new Error('Invalid response format from Reviews API')
    }

    // Process and store reviews
    let newReviews = 0
    let updatedReviews = 0
    let errors = 0

    for (const review of reviews) {
      try {
        // Check if review already exists
        const { data: existingReview } = await supabase
          .from('google_reviews')
          .select('id, update_time')
          .eq('review_id', review.reviewId)
          .single()

        const reviewData = {
          uid: review.uid,
          pid: review.pid,
          review_id: review.reviewId,
          reviewer_profile_photo_url: review.reviewerProfilePhotoUrl || null,
          reviewer_display_name: review.reviewerDisplayName,
          star_rating: review.starRating,
          rating_value: convertStarRatingToNumber(review.starRating),
          create_time: parseDateTime(review.createTime),
          update_time: parseDateTime(review.updateTime),
          comment: review.comment,
          original_comment: review.originalComment,
          reply_comment: review.replyComment || null,
          original_reply_comment: review.originalReplyComment || null,
          reply_time: parseDateTime(review.replyTime),
          location_id: review.locationId,
          branch_id: review.branchId,
          source: review.source,
          location_title: review.locationtitle,
          fetched_at: new Date().toISOString()
        }

        if (existingReview) {
          // Update existing review if it has been modified
          const existingUpdateTime = new Date(existingReview.update_time).getTime()
          const newUpdateTime = reviewData.update_time ? new Date(reviewData.update_time).getTime() : 0
          
          if (newUpdateTime > existingUpdateTime) {
            const { error } = await supabase
              .from('google_reviews')
              .update(reviewData)
              .eq('id', existingReview.id)

            if (error) throw error
            updatedReviews++
          }
        } else {
          // Insert new review
          const { error } = await supabase
            .from('google_reviews')
            .insert(reviewData)

          if (error) {
            // If error is due to duplicate key, skip it
            if (error.code === '23505') {
              continue
            }
            throw error
          }
          newReviews++
        }
      } catch (error) {
        console.error(`Error processing review ${review.reviewId}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed: ${newReviews} new reviews, ${updatedReviews} updated, ${errors} errors`,
      stats: {
        totalFetched: reviews.length,
        newReviews,
        updatedReviews,
        errors
      }
    })

  } catch (error) {
    console.error('Error fetching Google reviews:', error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch Google reviews'
    }, { status: 500 })
  }
}
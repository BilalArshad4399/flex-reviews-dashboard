import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filters from query parameters
    const listingId = searchParams.get("listingId")
    const type = searchParams.get("type") as "host-to-guest" | "guest-to-host" | null
    const ratingMin = searchParams.get("ratingMin") ? Number.parseInt(searchParams.get("ratingMin")!) : null
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const approvedOnly = searchParams.get("approvedOnly") === "true"


    // Build query with joins
    let query = supabase.from("reviews").select(`
        *,
        listings!inner(id, name, external_id),
        review_categories(category, rating)
      `)

    // Apply filters
    if (listingId) {
      query = query.eq("listings.external_id", listingId)
    }

    if (type) {
      query = query.eq("type", type)
    }

    if (ratingMin !== null) {
      query = query.gte("overall_rating", ratingMin)
    }

    if (from) {
      query = query.gte("submitted_at", from)
    }

    if (to) {
      query = query.lte("submitted_at", to)
    }

    if (approvedOnly) {
      query = query.eq("approved", true)
    }

    // Execute query
    const { data: reviews, error } = await query.order("submitted_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    // Transform to normalized format
    const normalizedReviews =
      reviews?.map((review) => ({
        id: review.id,
        external_id: review.external_id,
        listing: {
          id: review.listings.id,
          name: review.listings.name,
          external_id: review.listings.external_id,
        },
        listing_name: review.listings.name, // Add for compatibility
        type: review.type,
        status: review.status,
        overall_rating: review.overall_rating,
        rating: review.overall_rating, // Add rating field for compatibility
        public_review: review.public_review,
        submitted_at: review.submitted_at,
        guest_name: review.guest_name,
        source: review.source,
        approved: review.approved,
        approval: {
          is_approved: review.approved,
          is_restricted: false,
        },
        categories: review.review_categories || [],
      })) || []


    return NextResponse.json({
      success: true,
      data: normalizedReviews,
      count: normalizedReviews.length,
      filters: { listingId, type, ratingMin, from, to, approvedOnly },
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        data: [],
        count: 0,
      },
      { status: 500 },
    )
  }
}

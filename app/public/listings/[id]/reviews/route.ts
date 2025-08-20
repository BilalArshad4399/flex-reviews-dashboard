import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: listingId } = params
    const { searchParams } = new URL(request.url)

    // Optional filters for public endpoint
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 50
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : 0

    console.log(`[v0] Fetching approved reviews for listing ${listingId}`)

    // Query only approved reviews for the specific listing
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select(`
        *,
        listings!inner(id, name, external_id),
        review_categories(category, rating)
      `)
      .eq("listings.external_id", listingId)
      .eq("approved", true)
      .order("submitted_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("[v0] Database error:", error)
      throw error
    }

    // Transform to public format
    const publicReviews =
      reviews?.map((review) => ({
        id: review.id,
        type: review.type,
        overall_rating: review.overall_rating,
        public_review: review.public_review,
        submitted_at: review.submitted_at,
        guest_name: review.guest_name,
        categories: review.review_categories || [],
      })) || []

    console.log(`[v0] Returning ${publicReviews.length} approved reviews for listing ${listingId}`)

    return NextResponse.json({
      success: true,
      data: publicReviews,
      count: publicReviews.length,
      listing_id: listingId,
      pagination: {
        limit,
        offset,
        has_more: publicReviews.length === limit,
      },
    })
  } catch (error) {
    console.error("[v0] Public reviews API error:", error)
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

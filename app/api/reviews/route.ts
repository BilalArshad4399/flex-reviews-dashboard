import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters for filtering
    const filters = {
      listing: searchParams.get("listing") || undefined,
      rating: searchParams.get("rating") ? Number.parseInt(searchParams.get("rating")!) : undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    }

    // Build query with joins
    let query = supabase.from("reviews").select(`
      *,
      listings!inner(id, name, external_id),
      review_categories(category, rating)
    `)

    // Apply filters
    if (filters.listing) {
      query = query.ilike("listings.name", `%${filters.listing}%`)
    }

    if (filters.rating) {
      query = query.eq("overall_rating", filters.rating)
    }

    if (filters.dateFrom) {
      query = query.gte("submitted_at", filters.dateFrom)
    }

    if (filters.dateTo) {
      query = query.lte("submitted_at", filters.dateTo)
    }

    if (filters.status === "approved") {
      query = query.eq("status", "approved")
    } else if (filters.status === "pending") {
      query = query.eq("status", "pending")
    } else if (filters.status === "restricted") {
      query = query.eq("status", "restricted")
    }

    // Execute query
    const { data: reviews, error } = await query.order("submitted_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    // Transform to match expected format
    const normalizedReviews = reviews?.map((review) => {
      // Determine restriction status
      const isRestricted = review.status === "restricted"
      const isApproved = review.status === "approved" || (review.approved === true && !isRestricted)
      
      return {
        id: review.id,
        hostaway_id: review.external_id,
        guest_name: review.guest_name,
        listing_name: review.listings.name,
        rating: review.overall_rating,
        public_review: review.public_review,
        submitted_at: new Date(review.submitted_at),
        categories: review.review_categories || [],
        approval: {
          is_approved: isApproved,
          is_restricted: isRestricted,
          approved_by: null,
          approved_at: isApproved ? new Date(review.updated_at) : undefined,
        },
        status: review.status || (review.approved ? "approved" : "pending"),
        type: review.type,
      }
    }) || []

    // Apply category filter if specified
    let filteredReviews = normalizedReviews
    if (filters.category) {
      filteredReviews = normalizedReviews.filter((review) =>
        review.categories.some((cat: any) => cat.category.toLowerCase() === filters.category?.toLowerCase())
      )
    }

    return NextResponse.json({
      success: true,
      data: filteredReviews,
      count: filteredReviews.length,
      filters: filters,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
        data: [],
        count: 0
      }, 
      { status: 500 }
    )
  }
}

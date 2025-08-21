import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Property ID to Listing Name Mapping
const PROPERTY_LISTING_MAPPING: Record<string, string> = {
  "175160": "Luxury Studio in Central London",
  "128652": "2B N1 A - 29 Shoreditch Heights",
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract filters from query parameters
    const listingId = searchParams.get("listingId")
    const propertyId = searchParams.get("propertyId") // New parameter for property mapping
    const type = searchParams.get("type") as "host-to-guest" | "guest-to-host" | null
    const ratingMin = searchParams.get("ratingMin") ? Number.parseInt(searchParams.get("ratingMin")!) : null
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    // Default to showing only approved reviews unless explicitly set to false
    const showOnlyApproved = searchParams.get("approvedOnly") !== "false"

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

    // Apply property mapping filter
    if (propertyId && PROPERTY_LISTING_MAPPING[propertyId]) {
      const mappedListingName = PROPERTY_LISTING_MAPPING[propertyId]
      query = query.eq("listings.name", mappedListingName)
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

    // Apply approved filter based on showOnlyApproved setting
    if (showOnlyApproved) {
      query = query.eq("approved", true)
    }

    // Execute query
    const { data: reviews, error } = await query.order("submitted_at", { ascending: false })

    if (error) {
      throw error
    }

    if (!reviews || reviews.length === 0) {
      
      // If propertyId is specified, return empty structure with listing info
      if (propertyId) {
        return NextResponse.json({
          listing: {
            id: null,
            name: PROPERTY_LISTING_MAPPING[propertyId] || 'Unknown Property',
            external_id: propertyId,
            reviews: [],
            totalReviews: 0,
            averageRating: 0
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        filters: { listingId, propertyId, type, ratingMin, from, to, showOnlyApproved },
      })
    }

    // Group reviews by listing
    const listingsMap = new Map()

    reviews.forEach((review) => {
      const listingKey = review.listings.id

      if (!listingsMap.has(listingKey)) {
        listingsMap.set(listingKey, {
          listing: {
            id: review.listings.id,
            name: review.listings.name,
            external_id: review.listings.external_id,
            reviews: [],
            totalReviews: 0,
            averageRating: 0
          }
        })
      }

      const listingData = listingsMap.get(listingKey)
      
      // Transform categories to key-value object
      const categoriesObj: Record<string, number> = {}
      if (review.review_categories && review.review_categories.length > 0) {
        review.review_categories.forEach((cat: any) => {
          categoriesObj[cat.category] = cat.rating
        })
      }

      // Add review to listing
      listingData.listing.reviews.push({
        id: review.id,
        type: review.type,
        rating: review.overall_rating,
        reviewText: review.public_review,
        categories: categoriesObj,
        guestName: review.guest_name,
        submittedAt: review.submitted_at,
        status: review.status,
        approved: review.approved
      })
    })

    // Calculate average ratings for each listing
    listingsMap.forEach((listingData) => {
      const reviews = listingData.listing.reviews
      listingData.listing.totalReviews = reviews.length
      
      // Calculate average rating excluding null ratings
      const validRatings = reviews.filter((review: any) => review.rating !== null).map((review: any) => review.rating)
      if (validRatings.length > 0) {
        listingData.listing.averageRating = Number((validRatings.reduce((sum: number, rating: number) => sum + rating, 0) / validRatings.length).toFixed(1))
      } else {
        listingData.listing.averageRating = 0
      }
    })

    // Convert map to array
    const groupedData = Array.from(listingsMap.values())

    // If propertyId is specified, return single listing object or empty structure
    if (propertyId) {
      if (groupedData.length > 0) {
        return NextResponse.json(groupedData[0])
      } else {
        // Return empty structure if no reviews found
        return NextResponse.json({
          listing: {
            id: null,
            name: PROPERTY_LISTING_MAPPING[propertyId] || 'Unknown Property',
            external_id: propertyId,
            reviews: [],
            totalReviews: 0,
            averageRating: 0
          }
        })
      }
    }

    // Otherwise return all listings in array format
    return NextResponse.json({
      success: true,
      data: groupedData,
      count: groupedData.length,
      filters: { listingId, propertyId, type, ratingMin, from, to, showOnlyApproved },
    })
  } catch (error) {
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

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Fetch all reviews and filter for approved ones
    const reviewsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/reviews`)
    const reviewsData = await reviewsResponse.json()

    if (!reviewsData.success) {
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    // Filter for approved reviews only
    const approvedReviews = reviewsData.data.filter((review: any) => review.approval?.is_approved)

    return NextResponse.json({
      success: true,
      data: approvedReviews,
      count: approvedReviews.length,
    })
  } catch (error) {
    console.error("Error fetching approved reviews:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

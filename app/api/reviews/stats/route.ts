import { type NextRequest, NextResponse } from "next/server"
import type { ReviewStats } from "@/lib/types"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: reviews, error } = await supabase.from("reviews").select(`
        id,
        overall_rating,
        approved,
        status,
        created_at,
        review_categories (
          category,
          rating
        )
      `)

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    const totalReviews = reviews?.length || 0
    
    
    // Use status field for counting, with fallback to approved field for backward compatibility
    const approvedReviews = reviews?.filter((r) => 
      r.status === "approved" || (r.status === null && r.approved === true)
    ).length || 0
    
    const pendingReviews = reviews?.filter((r) => 
      r.status === "pending" || (r.status === null && r.approved === null)
    ).length || 0
    
    const rejectedReviews = reviews?.filter((r) => 
      r.status === "restricted" || (r.status === null && r.approved === false)
    ).length || 0
    

    // Only include reviews with ratings in the average calculation
    const reviewsWithRatings = reviews?.filter(r => r.overall_rating !== null && r.overall_rating !== undefined) || []
    const averageRating =
      reviewsWithRatings.length > 0 
        ? reviewsWithRatings.reduce((sum, review) => sum + review.overall_rating, 0) / reviewsWithRatings.length 
        : 0

    const categoryTotals: Record<string, { sum: number; count: number }> = {}

    reviews?.forEach((review) => {
      review.review_categories?.forEach((cat: any) => {
        if (!categoryTotals[cat.category]) {
          categoryTotals[cat.category] = { sum: 0, count: 0 }
        }
        categoryTotals[cat.category].sum += cat.rating
        categoryTotals[cat.category].count += 1
      })
    })

    const categoryAverages: Record<string, number> = {}
    Object.keys(categoryTotals).forEach((category) => {
      categoryAverages[category] = Math.round((categoryTotals[category].sum / categoryTotals[category].count) * 10) / 10
    })

    // Calculate category breakdown
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, data]) => ({
      category: category.replace("_", " "),
      count: data.count,
    }))

    // Calculate rating distribution
    const ratingDistribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(rating => ({
      rating: rating.toString(),
      count: reviews?.filter(r => r.overall_rating === rating).length || 0,
    }))

    // Calculate monthly trends (last 6 months)
    const monthlyData: Record<string, { count: number; totalRating: number; ratingCount: number }> = {}
    reviews?.forEach(review => {
      if (review.created_at) {
        const date = new Date(review.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, totalRating: 0, ratingCount: 0 }
        }
        
        monthlyData[monthKey].count += 1
        if (review.overall_rating) {
          monthlyData[monthKey].totalRating += review.overall_rating
          monthlyData[monthKey].ratingCount += 1
        }
      }
    })

    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        count: data.count,
        averageRating: data.ratingCount > 0 ? Math.round((data.totalRating / data.ratingCount) * 10) / 10 : 0,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)

    const reviewStats: ReviewStats = {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      categoryAverages,
      categoryBreakdown,
      ratingDistribution,
      monthlyTrends,
    }

    return NextResponse.json({
      success: true,
      data: reviewStats,
    })
  } catch (error) {
    console.error("Error calculating review statistics:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate statistics",
      },
      { status: 500 },
    )
  }
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Users, Award, TrendingUp } from "lucide-react"
import type { NormalizedReview } from "@/lib/types"

interface ReviewsSummaryProps {
  reviews: NormalizedReview[]
}

export function ReviewsSummary({ reviews }: ReviewsSummaryProps) {
  const totalReviews = reviews.length
  const reviewsWithRating = reviews.filter((r) => r.rating !== null)
  const averageRating =
    reviewsWithRating.length > 0
      ? reviewsWithRating.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsWithRating.length
      : 0

  const ratingDistribution = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviewsWithRating.filter((r) => r.rating === rating).length,
    percentage:
      reviewsWithRating.length > 0
        ? (reviewsWithRating.filter((r) => r.rating === rating).length / reviewsWithRating.length) * 100
        : 0,
  }))

  const topCategories = reviews
    .flatMap((r) => r.categories)
    .reduce(
      (acc, cat) => {
        if (!acc[cat.category]) {
          acc[cat.category] = { sum: 0, count: 0 }
        }
        acc[cat.category].sum += cat.rating
        acc[cat.category].count += 1
        return acc
      },
      {} as Record<string, { sum: number; count: number }>,
    )

  const categoryAverages = Object.entries(topCategories)
    .map(([category, data]) => ({
      category: category.replace("_", " "),
      average: data.sum / data.count,
    }))
    .sort((a, b) => b.average - a.average)
    .slice(0, 3)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Overall Rating */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-primary fill-current" />
          </div>
          <div className="text-3xl font-bold text-primary mb-1">{averageRating.toFixed(1)}</div>
          <p className="text-sm text-muted-foreground">Average Rating</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(averageRating / 2) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Total Reviews */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-secondary" />
          </div>
          <div className="text-3xl font-bold text-secondary mb-1">{totalReviews}</div>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-xs text-muted-foreground mt-1">Verified guests only</p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6 text-accent" />
          </div>
          <div className="text-3xl font-bold text-accent mb-1">{categoryAverages[0]?.average.toFixed(1) || "N/A"}</div>
          <p className="text-sm text-muted-foreground capitalize">{categoryAverages[0]?.category || "No data"}</p>
          <p className="text-xs text-muted-foreground mt-1">Top rated category</p>
        </CardContent>
      </Card>

      {/* Recommendation Rate */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {reviewsWithRating.length > 0
              ? Math.round(
                  (reviewsWithRating.filter((r) => (r.rating || 0) >= 8).length / reviewsWithRating.length) * 100,
                )
              : 0}
            %
          </div>
          <p className="text-sm text-muted-foreground">Recommend Rate</p>
          <p className="text-xs text-muted-foreground mt-1">8+ star reviews</p>
        </CardContent>
      </Card>
    </div>
  )
}

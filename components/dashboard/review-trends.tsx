"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import type { NormalizedReview } from "@/lib/types"

interface ReviewTrendsProps {
  reviews: NormalizedReview[]
}

export function ReviewTrends({ reviews }: ReviewTrendsProps) {
  // Generate monthly trend data
  const monthlyData = reviews.reduce(
    (acc, review) => {
      const date = new Date(review.submitted_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          totalRating: 0,
          ratingCount: 0,
        }
      }

      acc[monthKey].count += 1
      if (review.rating) {
        acc[monthKey].totalRating += review.rating
        acc[monthKey].ratingCount += 1
      }

      return acc
    },
    {} as Record<string, { month: string; count: number; totalRating: number; ratingCount: number }>,
  )

  const trendData = Object.values(monthlyData)
    .map((data) => ({
      month: data.month,
      reviews: data.count,
      averageRating: data.ratingCount > 0 ? data.totalRating / data.ratingCount : 0,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6) // Last 6 months

  // Generate category performance data
  const categoryData = reviews
    .flatMap((r) => r.categories)
    .reduce(
      (acc, cat) => {
        if (!acc[cat.category]) {
          acc[cat.category] = { category: cat.category, total: 0, count: 0 }
        }
        acc[cat.category].total += cat.rating
        acc[cat.category].count += 1
        return acc
      },
      {} as Record<string, { category: string; total: number; count: number }>,
    )

  const categoryPerformance = Object.values(categoryData)
    .map((data) => ({
      category: data.category.replace("_", " "),
      average: data.total / data.count,
    }))
    .sort((a, b) => b.average - a.average)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Review Trends (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar yAxisId="left" dataKey="reviews" fill="hsl(var(--primary))" opacity={0.3} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="averageRating"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--secondary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 10]} />
              <YAxis dataKey="category" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="average" fill="hsl(var(--accent))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

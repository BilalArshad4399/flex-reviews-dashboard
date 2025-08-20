"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ReviewStats } from "@/lib/types"

interface CategoryInsightsProps {
  stats: ReviewStats
}

export function CategoryInsights({ stats }: CategoryInsightsProps) {
  const categories = Object.entries(stats.categoryAverages).sort(([, a], [, b]) => b - a)

  const getCategoryColor = (rating: number) => {
    if (rating >= 9) return "text-green-600"
    if (rating >= 7) return "text-yellow-600"
    return "text-red-600"
  }

  const formatCategoryName = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(([category, rating]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{formatCategoryName(category)}</span>
              <span className={`text-sm font-bold ${getCategoryColor(rating)}`}>{rating.toFixed(1)}/10</span>
            </div>
            <Progress value={(rating / 10) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

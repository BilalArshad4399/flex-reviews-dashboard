"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Tooltip,
} from "recharts"
import { motion } from "framer-motion"
import type { NormalizedReview } from "@/lib/types"

interface AnimatedChartsProps {
  reviews: NormalizedReview[]
}

const colors = [
  "#284E4C", // Flex primary
  "#10b981", 
  "#6366f1", 
  "#ea580c", 
  "#475569",
  "#8b5cf6"
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-gray-200 rounded-lg p-3 shadow-lg backdrop-blur-sm">
        <p className="font-medium text-foreground">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function AnimatedCharts({ reviews }: AnimatedChartsProps) {
  // Generate rating distribution from real data
  const ratingDistribution = [10, 9, 8, 7, 6].map((rating) => ({
    rating: rating.toString(),
    count: reviews.filter((r) => r.rating === rating).length,
    color: colors[10 - rating],
    label: `${rating} Stars`
  }))
  
  // Add ≤5 category
  const lowRatingCount = reviews.filter((r) => r.rating && r.rating <= 5).length
  ratingDistribution.push({
    rating: "≤5",
    count: lowRatingCount,
    color: "#ea580c",
    label: "5 or Less"
  })

  // Generate category data from real reviews
  const categoryTotals: Record<string, number> = {}
  reviews.forEach((review) => {
    review.categories?.forEach((cat) => {
      categoryTotals[cat.category] = (categoryTotals[cat.category] || 0) + 1
    })
  })

  const categoryData = Object.entries(categoryTotals)
    .map(([name, value], index) => ({
      name: name.replace("_", " "),
      value,
      color: colors[index % colors.length],
      label: `${name.replace("_", " ")} Reviews`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 categories

  // Generate monthly trend data
  const monthlyData = reviews.reduce((acc, review) => {
    const date = new Date(review.submitted_at)
    const monthKey = date.toLocaleString('default', { month: 'short' })
    
    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthKey, reviews: 0, totalRating: 0, ratingCount: 0 }
    }
    
    acc[monthKey].reviews += 1
    if (review.rating) {
      acc[monthKey].totalRating += review.rating
      acc[monthKey].ratingCount += 1
    }
    
    return acc
  }, {} as Record<string, { month: string; reviews: number; totalRating: number; ratingCount: number }>)

  const trendData = Object.values(monthlyData)
    .map((data) => ({
      month: data.month,
      reviews: data.reviews,
      rating: data.ratingCount > 0 ? +(data.totalRating / data.ratingCount).toFixed(1) : 0,
      label: data.month
    }))
    .slice(-6) // Last 6 entries

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
              Rating Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#284E4C" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="rating"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                    fill="url(#barGradient)"
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[16px] mt-4"></div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-primary animate-pulse" />
              Review Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trend Analysis */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary to-accent animate-pulse" />
              Review Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#284E4C" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#284E4C" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="reviews"
                    stroke="#284E4C"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    className="hover:opacity-80 transition-opacity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[16px] mt-4"></div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

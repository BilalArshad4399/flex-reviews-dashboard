"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Star, Users, CheckCircle, Clock, XCircle, Eye } from "lucide-react"
import { motion } from "framer-motion"

import type { ReviewStats } from "@/lib/types"

interface StatsOverviewProps {
  stats: ReviewStats
}

export function EnhancedStatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Total Reviews",
      value: stats.totalReviews,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Average Rating",
      value: `${stats.averageRating}/10`,
      icon: Star,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      change: "+0.3",
      trend: "up",
    },
    {
      title: "Approved",
      value: stats.approvedReviews,
      icon: CheckCircle,
      color: "from-emerald-500 to-green-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      change: "+8%",
      trend: "up",
    },
    {
      title: "Pending",
      value: stats.pendingReviews,
      icon: Clock,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      change: "-2%",
      trend: "down",
    },
    {
      title: "Rejected",
      value: stats.rejectedReviews,
      icon: XCircle,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      change: "0%",
      trend: "neutral",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        const TrendIcon = stat.trend === "up" ? TrendingUp : stat.trend === "down" ? TrendingDown : Eye

        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              {/* Gradient background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
              />

              {/* Animated border */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className={`h-4 w-4 ${stat.textColor}`} />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {stat.value}
                  </div>
                  <Badge
                    variant={stat.trend === "up" ? "default" : stat.trend === "down" ? "destructive" : "secondary"}
                    className="flex items-center gap-1 text-xs"
                  >
                    <TrendIcon className="h-3 w-3" />
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.trend === "up" ? "↗ Trending up" : stat.trend === "down" ? "↘ Trending down" : "→ No change"}
                </p>
              </CardContent>

              {/* Shimmer effect */}
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

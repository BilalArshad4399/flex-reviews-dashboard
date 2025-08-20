"use client"

import { useEffect, useState } from "react"
import { EnhancedStatsOverview } from "@/components/dashboard/enhanced-stats-overview"
import { AnimatedCharts } from "@/components/dashboard/animated-charts"
import { CategoryInsights } from "@/components/dashboard/category-insights"
import { ReviewsTable } from "@/components/dashboard/reviews-table"
import { BulkActions } from "@/components/dashboard/bulk-actions"
import { AdvancedFilters } from "@/components/dashboard/advanced-filters"
import { ReviewTrends } from "@/components/dashboard/review-trends"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Sparkles, Database, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"
import type { NormalizedReview, ReviewStats, ReviewFilters } from "@/lib/types"
import { toast } from "sonner"
import { FlexLogo } from "@/components/flex-logo"

export default function DashboardPage() {
  const [allReviews, setAllReviews] = useState<NormalizedReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedReviews, setSelectedReviews] = useState<number[]>([])
  const [filters, setFilters] = useState<ReviewFilters>({})

  const fetchData = async () => {
    setLoading(true)
    try {
      const [reviewsResponse, statsResponse] = await Promise.all([fetch("/api/reviews"), fetch("/api/reviews/stats")])

      let reviewsData, statsData

      // Check if response is JSON before parsing
      const reviewsContentType = reviewsResponse.headers.get("content-type")
      if (reviewsContentType && reviewsContentType.includes("application/json")) {
        reviewsData = await reviewsResponse.json()
      } else {
        await reviewsResponse.text()
        console.error("Reviews API returned non-JSON response")
        reviewsData = { success: false, error: "Invalid response format" }
      }

      const statsContentType = statsResponse.headers.get("content-type")
      if (statsContentType && statsContentType.includes("application/json")) {
        statsData = await statsResponse.json()
      } else {
        await statsResponse.text()
        console.error("Stats API returned non-JSON response")
        statsData = { success: false, error: "Invalid response format" }
      }


      if (reviewsData.success) {
        setAllReviews(reviewsData.data)
      } else {
        setAllReviews([]) // Set empty array as fallback
      }

      if (statsData.success) {
        setStats(statsData.data)
      } else {
        // Set default stats as fallback
        setStats({
          totalReviews: 0,
          averageRating: 0,
          approvedReviews: 0,
          pendingReviews: 0,
          rejectedReviews: 0,
          categoryAverages: {},
          categoryBreakdown: [],
          ratingDistribution: [],
          monthlyTrends: [],
        })
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      // Set fallback data
      setAllReviews([])
      setStats({
        totalReviews: 0,
        averageRating: 0,
        approvedReviews: 0,
        pendingReviews: 0,
        rejectedReviews: 0,
        categoryAverages: {},
        categoryBreakdown: [],
        ratingDistribution: [],
        monthlyTrends: [],
      })
    } finally {
      setLoading(false)
    }
  }

  // Sync reviews from JSON file to database
  const syncReviewsFromFile = async () => {
    setSyncing(true)
    try {
      // Sync reviews
      const response = await fetch("/api/ingest", {
        method: "POST",
      })
      
      const data = await response.json()
      
      if (data.success) {
        
        // Show detailed sync results
        const message = data.processed > 0 || data.updated > 0 
          ? `${data.processed > 0 ? `${data.processed} new` : ''}${data.processed > 0 && data.updated > 0 ? ', ' : ''}${data.updated > 0 ? `${data.updated} updated` : ''}`
          : 'All reviews are up to date'
        
        toast.success(
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <div>
              <p className="font-semibold">Sync Successful!</p>
              <p className="text-sm">{message}</p>
              {data.skipped > 0 && (
                <p className="text-xs text-gray-600">{data.skipped} unchanged reviews skipped</p>
              )}
            </div>
          </div>
        )
        // Refresh the data after sync
        await fetchData()
      } else {
        console.error("[Sync Failed] Details:", data)
        toast.error(
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <div>
              <p className="font-semibold">Sync Failed</p>
              <p className="text-sm">{data.message || "Failed to sync reviews"}</p>
              <p className="text-xs text-gray-500">Check console for details</p>
            </div>
          </div>
        )
      }
    } catch (error) {
      console.error("Sync error:", error)
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <div>
            <p className="font-semibold">Sync Error</p>
            <p className="text-sm">Failed to connect to the server</p>
          </div>
        </div>
      )
    } finally {
      setSyncing(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...allReviews]

    if (filters.listing) {
      filtered = filtered.filter((review) => review.listing_name?.toLowerCase().includes(filters.listing!.toLowerCase()))
    }

    if (filters.rating) {
      filtered = filtered.filter((review) => review.rating && review.rating >= filters.rating!)
    }

    if (filters.category) {
      filtered = filtered.filter((review) => review.categories?.some((cat) => cat.category === filters.category))
    }

    if (filters.status && filters.status !== "all" as any) {
      filtered = filtered.filter((review) => {
        const isApproved = review.approval?.is_approved
        const isRestricted = review.approval?.is_restricted
        return (
          (filters.status === "approved" && isApproved && !isRestricted) ||
          (filters.status === "pending" && !isApproved && !isRestricted) ||
          (filters.status === "restricted" && isRestricted) ||
          (filters.status === "rejected" && false) // Mock: no rejected reviews
        )
      })
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      filtered = filtered.filter((review) => new Date(review.submitted_at) >= fromDate)
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      filtered = filtered.filter((review) => new Date(review.submitted_at) <= toDate)
    }

    setFilteredReviews(filtered)
    setSelectedReviews([]) // Clear selection when filters change
  }, [allReviews, filters])

  const handleApprove = async (reviewId: number, approved: boolean, reason?: string, isRestricted?: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved,
          rejectionReason: reason,
          approvedBy: "manager@flex.global",
          isRestricted,
        }),
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Error updating review approval:", error)
    }
  }

  const handleBulkApprove = async (reviewIds: number[], approved: boolean, reason?: string, isRestricted?: boolean) => {
    try {
      await Promise.all(
        reviewIds.map((id) =>
          fetch(`/api/reviews/${id}/approve`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              approved,
              rejectionReason: reason,
              approvedBy: "manager@flex.global",
              isRestricted,
            }),
          }),
        ),
      )
      fetchData()
      setSelectedReviews([])
    } catch (error) {
      console.error("Error bulk updating reviews:", error)
    }
  }

  const handleSelectAll = (selected: boolean) => {
    setSelectedReviews(selected ? filteredReviews.map((r) => r.id) : [])
  }

  const uniqueProperties = Array.from(new Set(allReviews.map((r) => r.listing_name))).sort()
  const uniqueCategories = Array.from(new Set(allReviews.flatMap((r) => r.categories.map((c) => c.category)))).sort()

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <RefreshCw className="w-12 h-12 animate-spin text-primary" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20 animate-pulse" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Loading dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--flex-background)]">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header with Flex branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between bg-white rounded-xl p-6 flex-shadow">
            <div className="flex items-center gap-8">
              <FlexLogo size="large" />
              <div>
                <h1 className="text-3xl font-bold text-[var(--flex-primary)]">
                  Reviews Dashboard
                </h1>
                <p className="text-[var(--flex-text)] mt-1">
                  Manage guest reviews and feedback
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={syncReviewsFromFile}
                  disabled={syncing}
                  className="bg-[var(--flex-primary)] hover:bg-[var(--flex-green-dark)] text-white flex-shadow hover:flex-shadow-lg transition-all duration-300"
                  size="lg"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      Sync Reviews
                    </>
                  )}
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => window.open('/reviews', '_blank')}
                  variant="outline"
                  className="border-[var(--flex-primary)] text-[var(--flex-primary)] hover:bg-[var(--flex-primary)] hover:text-white transition-all duration-300"
                  size="lg"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Reviews
                  <Sparkles className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {stats && <EnhancedStatsOverview stats={stats} />}

        <AnimatedCharts reviews={allReviews} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Tabs defaultValue="reviews" className="space-y-6">
            <TabsList className="bg-white border border-[var(--border)] flex-shadow p-1 h-12">
              <TabsTrigger
                value="reviews"
                className="data-[state=active]:bg-[var(--flex-primary)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 px-6 font-medium text-sm"
              >
                Review Management
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-[var(--flex-primary)] data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 px-6 font-medium text-sm"
              >
                Analytics & Trends
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <AdvancedFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  properties={uniqueProperties}
                  categories={uniqueCategories}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <BulkActions
                  selectedReviews={selectedReviews}
                  reviews={filteredReviews}
                  onBulkApprove={handleBulkApprove}
                  onSelectAll={handleSelectAll}
                  onClearSelection={() => setSelectedReviews([])}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <ReviewsTable
                  reviews={filteredReviews}
                  onApprove={handleApprove}
                  selectedReviews={selectedReviews}
                  onSelectionChange={setSelectedReviews}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-6 lg:grid-cols-3"
              >
                <div className="lg:col-span-2">
                  <ReviewTrends reviews={allReviews} />
                </div>
                <div>{stats && <CategoryInsights stats={stats} />}</div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

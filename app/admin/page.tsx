"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area
} from 'recharts'
import { 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Star, MessageSquare, Users, Calendar, Filter, ChevronDown,
  Eye, EyeOff, Globe, Building2, BarChart3, Activity,
  ThumbsUp, ThumbsDown, Clock, ChevronRight, Home, RefreshCw, Database
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface Review {
  id: number
  listing_name: string
  guest_name: string
  rating: number | null
  public_review: string
  submitted_at: string
  categories: Array<{ category: string; rating: number }>
  approval?: { is_approved: boolean }
  source?: string
}

interface PropertyData {
  name: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  approvedReviews: number
  performanceScore: number
  trend: 'up' | 'down' | 'stable'
  issues: string[]
}

export default function AdminDashboard() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [properties, setProperties] = useState<PropertyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string>("all")
  const [dateRange, setDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("performance")
  const [filterRating, setFilterRating] = useState("all")
  const [showOnlyPublic, setShowOnlyPublic] = useState(false)
  const [selectedReviewsForPublic, setSelectedReviewsForPublic] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedProperty, setExpandedProperty] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchReviews()
  }, [])
  
  useEffect(() => {
    if (reviews.length > 0) {
      processPropertyData(reviews)
    }
  }, [dateRange, reviews])

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews")
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data)
        // Don't process here, let the useEffect handle it
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Sync reviews from JSON file to database
  const syncReviewsFromFile = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
      })
      
      const data = await response.json()
      
      if (data.success) {
        const message = data.processed > 0 || data.updated > 0 
          ? `${data.processed > 0 ? `${data.processed} new` : ''}${data.processed > 0 && data.updated > 0 ? ', ' : ''}${data.updated > 0 ? `${data.updated} updated` : ''}`
          : 'All reviews are up to date'
        
        toast.success(`Sync Successful! ${message}`)
        // Refresh the data after sync
        await fetchReviews()
      } else {
        toast.error(`Sync Failed: ${data.message || "Failed to sync reviews"}`)
      }
    } catch (error) {
      toast.error("Sync Error: Failed to connect to the server")
    } finally {
      setSyncing(false)
    }
  }

  const toggleReviewApproval = async (reviewId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          approved: !currentStatus,
          approvedBy: "admin@property.com",
        }),
      })

      if (response.ok) {
        // Update local state
        setReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === reviewId 
              ? { ...review, approval: { is_approved: !currentStatus } }
              : review
          )
        )
        // Reprocess data
        processPropertyData(reviews.map(review => 
          review.id === reviewId 
            ? { ...review, approval: { is_approved: !currentStatus } }
            : review
        ))
      }
    } catch (error) {
    }
  }

  const handleBulkApproval = async (approve: boolean) => {
    const reviewIds = Array.from(selectedReviewsForPublic)
    
    try {
      await Promise.all(
        reviewIds.map(id =>
          fetch(`/api/reviews/${id}/approve`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              approved: approve,
              approvedBy: "admin@property.com",
            }),
          })
        )
      )
      
      // Refresh data
      await fetchReviews()
      setSelectedReviewsForPublic(new Set())
    } catch (error) {
    }
  }

  const getFilteredReviews = () => {
    if (dateRange === 'all') return reviews
    
    const daysToSubtract = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)
    
    return reviews.filter(review => 
      new Date(review.submitted_at) >= cutoffDate
    )
  }

  const processPropertyData = (reviewsData: Review[]) => {
    const propertyMap = new Map<string, PropertyData>()
    
    // Filter reviews based on date range
    let filteredReviews = [...reviewsData]
    const now = new Date()
    
    if (dateRange !== 'all') {
      const daysToSubtract = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract)
      
      filteredReviews = reviewsData.filter(review => 
        new Date(review.submitted_at) >= cutoffDate
      )
    }

    filteredReviews.forEach(review => {
      const propertyName = review.listing_name || "Unknown"
      
      if (!propertyMap.has(propertyName)) {
        propertyMap.set(propertyName, {
          name: propertyName,
          reviews: [],
          averageRating: 0,
          totalReviews: 0,
          approvedReviews: 0,
          performanceScore: 0,
          trend: 'stable',
          issues: []
        })
      }

      const property = propertyMap.get(propertyName)!
      property.reviews.push(review)
    })

    // Calculate metrics for each property
    propertyMap.forEach(property => {
      property.totalReviews = property.reviews.length
      property.approvedReviews = property.reviews.filter(r => r.approval?.is_approved).length
      
      const validRatings = property.reviews.filter(r => r.rating !== null).map(r => r.rating!)
      property.averageRating = validRatings.length > 0 
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length 
        : 0

      // Calculate performance score (0-100)
      // 40% weight on rating (0-10 scale)
      const ratingScore = (property.averageRating / 10) * 40
      
      // 20% weight on volume (capped at 20 reviews for max score)
      const volumeScore = Math.min(property.totalReviews / 20, 1) * 20
      
      // 20% weight on approval rate
      const approvalRate = property.totalReviews > 0 ? property.approvedReviews / property.totalReviews : 0
      const approvalScore = approvalRate * 20
      
      // 20% weight on recent activity (5+ reviews in last 30 days = max score)
      const recentScore = calculateRecentActivityScore(property.reviews) * 20
      
      property.performanceScore = Math.round(ratingScore + volumeScore + approvalScore + recentScore)

      // Determine trend
      property.trend = calculateTrend(property.reviews)

      // Identify issues
      property.issues = identifyIssues(property.reviews)
    })

    setProperties(Array.from(propertyMap.values()))
  }

  const calculateRecentActivityScore = (reviews: Review[]) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentReviews = reviews.filter(r => new Date(r.submitted_at) > thirtyDaysAgo)
    return Math.min(recentReviews.length / 5, 1)
  }

  const calculateTrend = (reviews: Review[]): 'up' | 'down' | 'stable' => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const recentReviews = reviews.filter(r => new Date(r.submitted_at) > thirtyDaysAgo && r.rating)
    const previousReviews = reviews.filter(r => {
      const date = new Date(r.submitted_at)
      return date > sixtyDaysAgo && date <= thirtyDaysAgo && r.rating
    })

    if (recentReviews.length === 0 || previousReviews.length === 0) return 'stable'

    const recentAvg = recentReviews.reduce((a, b) => a + b.rating!, 0) / recentReviews.length
    const previousAvg = previousReviews.reduce((a, b) => a + b.rating!, 0) / previousReviews.length

    if (recentAvg > previousAvg + 0.5) return 'up'
    if (recentAvg < previousAvg - 0.5) return 'down'
    return 'stable'
  }

  const identifyIssues = (reviews: Review[]): string[] => {
    const issueCount: Record<string, number> = {}
    
    reviews.forEach(review => {
      if (review.rating && review.rating < 7) {
        review.categories?.forEach(cat => {
          if (cat.rating < 7) {
            issueCount[cat.category] = (issueCount[cat.category] || 0) + 1
          }
        })
      }
    })

    return Object.entries(issueCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category)
  }

  // Chart data preparation
  const getPerformanceChartData = () => {
    return properties
      .slice(0, 10)
      .map(p => ({
        name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
        fullName: p.name,
        performance: p.performanceScore,
        rating: p.averageRating * 10,
        reviews: p.totalReviews
      }))
  }

  const getRatingDistribution = () => {
    const distribution = { '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0 }
    getFilteredReviews().forEach(r => {
      if (r.rating) {
        if (r.rating <= 2) distribution['1-2']++
        else if (r.rating <= 4) distribution['3-4']++
        else if (r.rating <= 6) distribution['5-6']++
        else if (r.rating <= 8) distribution['7-8']++
        else distribution['9-10']++
      }
    })
    return Object.entries(distribution).map(([range, count]) => ({ 
      name: range, 
      range, 
      count 
    }))
  }

  const getCategoryPerformance = () => {
    const categoryTotals: Record<string, { total: number, count: number }> = {}
    
    getFilteredReviews().forEach(review => {
      review.categories?.forEach(cat => {
        if (!categoryTotals[cat.category]) {
          categoryTotals[cat.category] = { total: 0, count: 0 }
        }
        categoryTotals[cat.category].total += cat.rating
        categoryTotals[cat.category].count++
      })
    })

    return Object.entries(categoryTotals).map(([category, data]) => ({
      category: category.replace(/_/g, ' '),
      rating: data.total / data.count
    }))
  }

  const getMonthlyTrends = () => {
    const months: Record<string, { count: number, totalRating: number }> = {}
    const now = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now)
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleDateString('en', { month: 'short' })
      months[monthKey] = { count: 0, totalRating: 0 }
    }

    getFilteredReviews().forEach(review => {
      const reviewDate = new Date(review.submitted_at)
      const monthKey = reviewDate.toLocaleDateString('en', { month: 'short' })
      if (months[monthKey]) {
        months[monthKey].count++
        if (review.rating) {
          months[monthKey].totalRating += review.rating
        }
      }
    })

    return Object.entries(months).map(([month, data]) => ({
      month,
      reviews: data.count,
      avgRating: data.count > 0 ? data.totalRating / data.count : 0
    }))
  }

  const COLORS = ['#284E4C', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  // Apply filters to properties
  const getFilteredProperties = () => {
    let filtered = [...properties]
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Rating filter
    if (filterRating !== 'all') {
      filtered = filtered.filter(p => {
        if (filterRating === 'high') return p.averageRating >= 8
        if (filterRating === 'medium') return p.averageRating >= 5 && p.averageRating < 8
        if (filterRating === 'low') return p.averageRating < 5
        return true
      })
    }
    
    // Public only filter
    if (showOnlyPublic) {
      filtered = filtered.filter(p => p.approvedReviews > 0)
    }
    
    // Sort
    return filtered.sort((a, b) => {
      switch(sortBy) {
        case 'rating': return b.averageRating - a.averageRating
        case 'reviews': return b.totalReviews - a.totalReviews
        case 'recent': 
          const aRecent = a.reviews[0]?.submitted_at || '0'
          const bRecent = b.reviews[0]?.submitted_at || '0'
          return bRecent.localeCompare(aRecent)
        default: return b.performanceScore - a.performanceScore
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#284E4C] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFFDF7] via-white to-[#F1F3EE]">
      {/* Header */}
      <div className="bg-[#FFFDF6] backdrop-blur-lg border-b border-gray-200/50 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-[#284E4C] to-[#3a6562] bg-clip-text text-transparent">Flex Reviews Dashboard</h1>
                <p className="mt-2 text-gray-600 font-medium">Monitor performance, manage reviews, and track trends</p>
              </div>
              <div className="flex items-center gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px] bg-white border-gray-200 hover:bg-gray-50 transition-all">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  className="bg-gradient-to-r from-[#284E4C] to-[#3a6562] hover:from-[#1e3a39] hover:to-[#284E4C] text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  onClick={syncReviewsFromFile}
                  disabled={syncing}
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
                <a href="/properties" target="_blank" rel="noopener noreferrer">
                  <Button 
                    className="bg-white border-2 border-[#284E4C] text-[#284E4C] hover:bg-[#284E4C] hover:text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    View Properties
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#284E4C]/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Reviews</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{getFilteredReviews().length}</p>
                    <p className="text-sm text-green-600 mt-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span className="font-semibold">+12%</span>
                      <span className="ml-1 text-gray-600">from last month</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#284E4C]/10 to-[#284E4C]/5 rounded-2xl">
                    <MessageSquare className="w-10 h-10 text-[#284E4C]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Average Rating</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {(() => {
                        const filtered = getFilteredReviews().filter(r => r.rating)
                        return filtered.length > 0 
                          ? (filtered.reduce((a, b) => a + b.rating!, 0) / filtered.length).toFixed(1)
                          : '0.0'
                      })()}
                    </p>
                    <div className="flex text-yellow-400 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current drop-shadow-sm" />
                      ))}
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 rounded-2xl">
                    <Star className="w-10 h-10 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Active Properties</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">{properties.length}</p>
                    <p className="text-sm mt-2">
                      <span className="font-semibold text-purple-600">{properties.filter(p => p.performanceScore > 70).length}</span>
                      <span className="text-gray-600 ml-1">high performing</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-600/10 to-purple-600/5 rounded-2xl">
                    <Building2 className="w-10 h-10 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/5 to-transparent pointer-events-none" />
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Public Reviews</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">
                      {getFilteredReviews().filter(r => r.approval?.is_approved).length}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="font-semibold text-[#284E4C]">
                        {getFilteredReviews().length > 0 
                          ? Math.round((getFilteredReviews().filter(r => r.approval?.is_approved).length / getFilteredReviews().length) * 100)
                          : 0}%
                      </span>
                      <span className="text-gray-600 ml-1">approval rate</span>
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-600/10 to-green-600/5 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border-2 border-gray-400 p-2 shadow-2xl rounded-xl">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#284E4C] data-[state=active]:to-[#3a6562] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#284E4C] data-[state=active]:to-[#3a6562] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
              <Building2 className="w-4 h-4 mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#284E4C] data-[state=active]:to-[#3a6562] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
              <MessageSquare className="w-4 h-4 mr-2" />
              Review Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#284E4C] data-[state=active]:to-[#3a6562] data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Property Performance</CardTitle>
                  <CardDescription className="text-gray-600">Top 10 properties by performance score</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={getPerformanceChartData()} margin={{ bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        interval={0}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                                <p className="font-semibold text-sm mb-2">{payload[0].payload.fullName}</p>
                                {payload.map((entry: any, index: number) => (
                                  <p key={index} className="text-xs" style={{ color: entry.color }}>
                                    {entry.name}: {entry.value.toFixed(1)}
                                  </p>
                                ))}
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend />
                      <Bar dataKey="performance" fill="#284E4C" name="Performance Score" />
                      <Bar dataKey="rating" fill="#10B981" name="Rating" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Rating Distribution */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Rating Distribution</CardTitle>
                  <CardDescription className="text-gray-600">Review ratings breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getRatingDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {getRatingDistribution().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-2 rounded-lg shadow-lg border border-gray-200">
                                <p className="text-sm font-semibold">{payload[0].name}</p>
                                <p className="text-xs text-gray-600">{payload[0].value} reviews</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(_value: string, entry: any) => (
                          <span className="text-xs">{entry.payload.name}: {entry.payload.count}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Monthly Trends</CardTitle>
                  <CardDescription className="text-gray-600">Review volume and ratings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getMonthlyTrends()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="reviews" stroke="#284E4C" name="Reviews" />
                      <Line yAxisId="right" type="monotone" dataKey="avgRating" stroke="#10B981" name="Avg Rating" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Performance */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Category Performance</CardTitle>
                  <CardDescription className="text-gray-600">Average ratings by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={getCategoryPerformance()}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="category" />
                      <PolarRadiusAxis angle={90} domain={[0, 10]} />
                      <Radar name="Rating" dataKey="rating" stroke="#284E4C" fill="#284E4C" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Issues Alert */}
            <Card className="border-orange-200/50 bg-gradient-to-r from-orange-50 to-[#F1F3EE] shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  Recurring Issues Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {properties
                    .filter(p => p.issues.length > 0)
                    .slice(0, 3)
                    .map(property => (
                      <div key={property.name} className="bg-white/90 backdrop-blur p-4 rounded-xl border border-orange-200/50 shadow-lg hover:shadow-xl transition-all">
                        <h4 className="font-semibold text-gray-900 mb-2">{property.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.issues.map(issue => (
                            <Badge key={issue} variant="outline" className="border-orange-400 text-orange-700">
                              {issue.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <Input 
                    placeholder="Search properties..." 
                    className="max-w-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] bg-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance Score</SelectItem>
                      <SelectItem value="rating">Average Rating</SelectItem>
                      <SelectItem value="reviews">Review Count</SelectItem>
                      <SelectItem value="recent">Recent Activity</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-[180px] bg-white">
                      <SelectValue placeholder="Filter rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="high">High (8+)</SelectItem>
                      <SelectItem value="medium">Medium (5-7)</SelectItem>
                      <SelectItem value="low">Low (&lt;5)</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="public-only" 
                      checked={showOnlyPublic}
                      onCheckedChange={setShowOnlyPublic}
                    />
                    <Label htmlFor="public-only">Public reviews only</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getFilteredProperties().map(property => (
                  <motion.div
                    key={property.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{property.name}</CardTitle>
                            <CardDescription>
                              {property.totalReviews} reviews • {property.approvedReviews} public
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {property.averageRating.toFixed(1)}
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.round(property.averageRating / 2) ? 'fill-current' : ''}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Performance Bar */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="flex items-center gap-1">
                                Performance Score
                                <span className="text-xs text-gray-500" title="Based on: Rating (40%), Volume (20%), Approval Rate (20%), Recent Activity (20%)">ⓘ</span>
                              </span>
                              <span className="font-semibold">{property.performanceScore}%</span>
                            </div>
                            <div className="w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden">
                              <motion.div 
                                className={`h-full rounded-full ${
                                  property.performanceScore > 70 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                                  property.performanceScore > 50 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                                } shadow-sm`}
                                initial={{ width: 0 }}
                                animate={{ width: `${property.performanceScore}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                              />
                            </div>
                          </div>

                          {/* Trend Indicator */}
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">30-day trend</span>
                            <div className={`flex items-center gap-1 ${
                              property.trend === 'up' ? 'text-green-600' :
                              property.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {property.trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
                               property.trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
                               <span className="text-xs">→</span>}
                              <span className="text-sm font-medium">
                                {property.trend === 'up' ? 'Improving' :
                                 property.trend === 'down' ? 'Declining' : 'Stable'}
                              </span>
                            </div>
                          </div>

                          {/* Issues */}
                          {property.issues.length > 0 && (
                            <div>
                              <p className="text-sm text-gray-600 mb-2">Common issues:</p>
                              <div className="flex flex-wrap gap-2">
                                {property.issues.map(issue => (
                                  <Badge key={issue} variant="outline" className="text-xs">
                                    {issue.replace(/_/g, ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-gray-200/50 hover:bg-gray-50/50 transition-all"
                              onClick={() => setExpandedProperty(
                                expandedProperty === property.name ? null : property.name
                              )}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {expandedProperty === property.name ? 'Hide' : 'View'} Details
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-[#284E4C] to-[#3a6562] hover:from-[#1e3a39] hover:to-[#284E4C] text-white shadow-lg hover:shadow-xl transition-all"
                              onClick={() => {
                                setSelectedProperty(property.name)
                                setActiveTab("reviews")
                                // Scroll to top to see the selected property
                                setTimeout(() => {
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }, 100)
                              }}
                            >
                              <Globe className="w-4 h-4 mr-1" />
                              Manage Public
                            </Button>
                          </div>
                          
                          {/* Expanded Details */}
                          {expandedProperty === property.name && (
                            <div className="mt-4 pt-4 border-t space-y-3">
                              <div className="text-sm">
                                <p className="font-semibold mb-2">Recent Reviews:</p>
                                {property.reviews.slice(0, 3).map(review => (
                                  <div key={review.id} className="mb-2 p-2 bg-[#F1F3EE] rounded">
                                    <div className="flex items-center justify-between">
                                      <span className="font-medium">{review.guest_name}</span>
                                      {review.rating && (
                                        <span className="text-xs">{review.rating}/10 ★</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                      {review.public_review}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>

          {/* Reviews Management Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Review Selection for Public Display</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose which reviews appear on your public website
                  {selectedProperty !== 'all' && (
                    <span className="ml-2 text-[#284E4C] font-semibold">
                      • Currently viewing: {selectedProperty}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Property Selector */}
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {properties.map(p => (
                        <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Reviews List */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {reviews
                      .filter(r => selectedProperty === 'all' || r.listing_name === selectedProperty)
                      .slice(0, 20)
                      .map(review => (
                        <div key={review.id} className="p-4 border rounded-lg hover:bg-[#F1F3EE]">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedReviewsForPublic.has(review.id)}
                                onChange={() => {
                                  const newSelected = new Set(selectedReviewsForPublic)
                                  if (newSelected.has(review.id)) {
                                    newSelected.delete(review.id)
                                  } else {
                                    newSelected.add(review.id)
                                  }
                                  setSelectedReviewsForPublic(newSelected)
                                }}
                                className="mt-1 rounded border-gray-300 text-[#284E4C] focus:ring-[#284E4C]"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="font-medium">{review.guest_name}</span>
                                  {review.rating && (
                                    <div className="flex items-center">
                                      <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                          <Star 
                                            key={i} 
                                            className={`w-3 h-3 ${i < Math.round(review.rating! / 2) ? 'fill-current' : ''}`} 
                                          />
                                        ))}
                                      </div>
                                      <span className="ml-1 text-sm text-gray-600">({review.rating}/10)</span>
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant={review.approval?.is_approved ? 'default' : 'outline'}
                                    className="text-xs h-6 px-2"
                                    onClick={() => toggleReviewApproval(review.id, review.approval?.is_approved || false)}
                                  >
                                    {review.approval?.is_approved ? (
                                      <>
                                        <Eye className="w-3 h-3 mr-1" />
                                        Public
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3 h-3 mr-1" />
                                        Private
                                      </>
                                    )}
                                  </Button>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">{review.public_review}</p>
                                {/* Category Ratings */}
                                {review.categories && review.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {review.categories.map((cat, idx) => (
                                      <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-xs">
                                        <span className="font-medium capitalize">{cat.category.replace(/_/g, ' ')}:</span>
                                        <span className="text-gray-700 font-semibold">{cat.rating}/10</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                  <span>{review.listing_name}</span>
                                  <span>{new Date(review.submitted_at).toLocaleDateString()}</span>
                                  {review.source && <span>{review.source}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Bulk Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {selectedReviewsForPublic.size > 0 ? (
                        <span className="font-semibold">{selectedReviewsForPublic.size} reviews selected</span>
                      ) : (
                        <span>{reviews.filter(r => r.approval?.is_approved).length} of {reviews.length} reviews are public</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={selectedReviewsForPublic.size === 0}
                        className="border-gray-200/50 hover:bg-gray-50/50 transition-all"
                        onClick={() => handleBulkApproval(false)}
                      >
                        <EyeOff className="w-4 h-4 mr-1" />
                        Hide Selected ({selectedReviewsForPublic.size})
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-gradient-to-r from-[#284E4C] to-[#3a6562] hover:from-[#1e3a39] hover:to-[#284E4C] text-white shadow-lg hover:shadow-xl transition-all"
                        disabled={selectedReviewsForPublic.size === 0}
                        onClick={() => handleBulkApproval(true)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Approve Selected ({selectedReviewsForPublic.size})
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Review Sources */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Review Sources</CardTitle>
                  <CardDescription className="text-gray-600">Where your reviews come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={(() => {
                          const filteredReviews = getFilteredReviews()
                          const hostaway = filteredReviews.filter(r => !r.source || r.source === 'Hostaway').length
                          const direct = filteredReviews.filter(r => r.source === 'Direct').length
                          const other = filteredReviews.filter(r => r.source && r.source !== 'Hostaway' && r.source !== 'Direct').length
                          
                          // Only show categories that have data
                          const data = []
                          if (hostaway > 0) data.push({ name: 'Hostaway', value: hostaway })
                          if (direct > 0) data.push({ name: 'Direct', value: direct })
                          if (other > 0) data.push({ name: 'Other', value: other })
                          
                          return data.length > 0 ? data : [{ name: 'No Reviews', value: 1 }]
                        })()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(() => {
                          const filteredReviews = getFilteredReviews()
                          const hostaway = filteredReviews.filter(r => !r.source || r.source === 'Hostaway').length
                          const direct = filteredReviews.filter(r => r.source === 'Direct').length
                          const other = filteredReviews.filter(r => r.source && r.source !== 'Hostaway' && r.source !== 'Direct').length
                          
                          const data = []
                          if (hostaway > 0) data.push({ name: 'Hostaway', value: hostaway })
                          if (direct > 0) data.push({ name: 'Direct', value: direct })
                          if (other > 0) data.push({ name: 'Other', value: other })
                          
                          return (data.length > 0 ? data : [{ name: 'No Reviews', value: 1 }]).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))
                        })()}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Response Time Analysis */}
              <Card className="bg-white/80 backdrop-blur border-gray-200/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Weekly Activity</CardTitle>
                  <CardDescription className="text-gray-600">Review submission patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={getMonthlyTrends()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="reviews" stroke="#284E4C" fill="#284E4C" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-white border-green-200/50 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    Top Performing Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">{properties.sort((a, b) => b.performanceScore - a.performanceScore)[0]?.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        Score: {properties[0]?.performanceScore.toFixed(0)}%
                      </Badge>
                      <Badge variant="outline">
                        {properties[0]?.totalReviews} reviews
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200/50 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-orange-100 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-orange-600" />
                    </div>
                    Most Common Issue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold">Cleanliness</p>
                    <p className="text-sm text-gray-600">
                      Reported in {properties.filter(p => p.issues.includes('cleanliness')).length} properties
                    </p>
                    <Badge className="bg-orange-100 text-orange-800">
                      Needs Attention
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200/50 shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-600" />
                    </div>
                    Review Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">
                      {reviews.filter(r => new Date(r.submitted_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className="text-sm text-gray-600">Reviews this week</p>
                    <Badge className="bg-[#F1F3EE] text-[#284E4C]">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
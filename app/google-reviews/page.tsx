"use client"

import { useEffect, useState } from "react"
import { Star, MapPin, User, RefreshCw, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"

interface GoogleReview {
  id: string
  author_name: string
  author_url?: string
  rating: number
  relative_time_description: string
  text: string
  time: number
  profile_photo_url?: string
  property_name?: string
  property_address?: string
}

export default function GoogleReviewsPage() {
  const [reviews, setReviews] = useState<GoogleReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<GoogleReview[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [dataSource, setDataSource] = useState<'database' | 'empty'>('empty')
  const [sortBy, setSortBy] = useState('newest')
  const [visibleCount, setVisibleCount] = useState(10) // Initially show 10 reviews
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set()) // Track expanded reviews
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")

  const fetchGoogleReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews/google")
      const data = await response.json()
      
      if (data.success) {
        setReviews(data.data)
        setFilteredReviews(data.data)
        setDataSource(data.source || 'empty')
        // Set last sync time from localStorage
        const savedSyncTime = localStorage.getItem('lastGoogleReviewsSync')
        if (savedSyncTime) {
          setLastSyncTime(savedSyncTime)
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const syncReviewsFromGoSign = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/reviews/google/fetch", {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || 'Reviews synced successfully!')
        // Save sync time
        const syncTime = new Date().toISOString()
        localStorage.setItem('lastGoogleReviewsSync', syncTime)
        setLastSyncTime(syncTime)
        // Refresh the reviews list
        await fetchGoogleReviews()
      } else {
        toast.error(data.message || 'Failed to sync reviews')
      }
    } catch (error) {
      console.error('Error syncing reviews:', error)
      toast.error('Failed to sync reviews from API')
    } finally {
      setSyncing(false)
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    let filtered = reviews

    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (review.property_name && review.property_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    if (ratingFilter !== "all") {
      const minRating = parseInt(ratingFilter)
      filtered = filtered.filter((review) => review.rating >= minRating)
    }

    if (propertyFilter !== "all") {
      filtered = filtered.filter((review) => review.property_name === propertyFilter)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch(sortBy) {
        case 'oldest':
          return a.time - b.time
        case 'highest':
          return b.rating - a.rating
        case 'lowest':
          return a.rating - b.rating
        case 'newest':
        default:
          return b.time - a.time
      }
    })

    setFilteredReviews(sorted)
    // Reset visible count when filters change
    setVisibleCount(10)
  }, [reviews, searchTerm, ratingFilter, propertyFilter, sortBy])

  // Load more reviews function
  const loadMoreReviews = () => {
    setVisibleCount(prev => prev + 10)
  }

  // Toggle review expansion
  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev)
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId)
      } else {
        newSet.add(reviewId)
      }
      return newSet
    })
  }

  // Check if text needs truncation (more than 200 characters)
  const needsTruncation = (text: string) => text.length > 200

  const uniqueProperties = Array.from(
    new Set(reviews.map((review) => review.property_name).filter(Boolean))
  ).sort()

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0"


  useEffect(() => {
    fetchGoogleReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#284E4C]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFDF7]">
      {/* Custom Header for Google Reviews Page */}
      <header className="fixed left-0 right-0 w-full z-50 top-0 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-between h-[88px]">
            <Link className="flex items-center" href="/">
              <img 
                alt="The Flex" 
                fetchPriority="high" 
                width="120" 
                height="40" 
                className="object-contain"
                src="https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/Green_V3%20Symbol%20%26%20Wordmark%20(1).png"
                style={{ color: 'transparent' }}
              />
            </Link>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button className="bg-transparent hover:bg-[#F1F3EE] text-[#284E4C] border border-[#284E4C]/20 px-5 py-2.5 rounded-lg transition-all font-medium">
                  Home
                </Button>
              </Link>
              <Link href="/admin">
                <Button className="bg-transparent hover:bg-[#F1F3EE] text-[#284E4C] border border-[#284E4C]/20 px-5 py-2.5 rounded-lg transition-all font-medium">
                  Dashboard
                </Button>
              </Link>
              <Link href="/properties">
                <Button className="bg-transparent hover:bg-[#F1F3EE] text-[#284E4C] border border-[#284E4C]/20 px-5 py-2.5 rounded-lg transition-all font-medium">
                  View Properties
                </Button>
              </Link>
              <a href="https://theflex.global" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#284E4C] hover:bg-[#1e3a39] text-white px-5 py-2.5 rounded-lg transition-all font-medium">
                  Main Website →
                </Button>
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content Section */}
      <section className="mt-[88px] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#284E4C] mb-8">
              WHAT OUR CUSTOMERS SAY
            </h1>
            
            {/* Overall Rating */}
            <div className="bg-white rounded-lg border border-gray-200 p-8 max-w-2xl mx-auto mb-10">
              <div className="flex items-center justify-between">
                {/* Left Side - Rating */}
                <div className="flex items-center gap-6">
                  <div>
                    <div className="text-5xl font-bold text-[#284E4C] mb-2">
                      {averageRating}
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(parseFloat(averageRating))
                              ? "fill-[#FFC107] text-[#FFC107]"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {reviews.length} reviews
                    </p>
                  </div>
                  
                  {/* Google Badge */}
                  <div className="border-l pl-6 ml-6">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Google Reviews</span>
                    </div>
                    <p className="text-xs text-gray-500">Verified Customer Feedback</p>
                  </div>
                </div>
                
                {/* Right Side - Actions */}
                <div className="text-right">
                  <Button
                    onClick={syncReviewsFromGoSign}
                    disabled={syncing}
                    className="bg-[#284E4C] text-white hover:bg-[#1e3a39] font-medium px-6 py-2.5 rounded-lg transition-all"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Reviews
                      </>
                    )}
                  </Button>
                  {lastSyncTime && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last updated: {new Date(lastSyncTime).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="bg-gradient-to-r from-[#F1F3EE] to-[#E8EBE5] rounded-xl p-6 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-[#284E4C] font-semibold uppercase tracking-wider">Filter by Rating</label>
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="px-5 py-3 pr-10 border-2 border-[#284E4C]/20 rounded-lg bg-white hover:border-[#284E4C]/40 focus:outline-none focus:border-[#284E4C] focus:ring-2 focus:ring-[#284E4C]/20 transition-all cursor-pointer text-[#333333] font-medium shadow-sm hover:shadow-md appearance-none bg-no-repeat bg-[length:20px] bg-[right_0.8rem_center]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23284E4C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                    }}
                  >
                    <option value="all">All Reviews</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars & Up</option>
                    <option value="3">3 Stars & Up</option>
                  </select>
                </div>
                
                {uniqueProperties.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-[#284E4C] font-semibold uppercase tracking-wider">Filter by Location</label>
                    <select
                      value={propertyFilter}
                      onChange={(e) => setPropertyFilter(e.target.value)}
                      className="px-5 py-3 pr-10 border-2 border-[#284E4C]/20 rounded-lg bg-white hover:border-[#284E4C]/40 focus:outline-none focus:border-[#284E4C] focus:ring-2 focus:ring-[#284E4C]/20 transition-all cursor-pointer text-[#333333] font-medium shadow-sm hover:shadow-md appearance-none bg-no-repeat bg-[length:20px] bg-[right_0.8rem_center]"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23284E4C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                      }}
                    >
                      <option value="all">All Locations</option>
                      {uniqueProperties.map(property => (
                        <option key={property} value={property}>{property}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-xs text-[#284E4C] font-semibold uppercase tracking-wider">Sort Results</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-5 py-3 pr-10 border-2 border-[#284E4C]/20 rounded-lg bg-white hover:border-[#284E4C]/40 focus:outline-none focus:border-[#284E4C] focus:ring-2 focus:ring-[#284E4C]/20 transition-all cursor-pointer text-[#333333] font-medium shadow-sm hover:shadow-md appearance-none bg-no-repeat bg-[length:20px] bg-[right_0.8rem_center]"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23284E4C'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Source Indicator */}
          {dataSource === 'empty' && reviews.length === 0 && (
            <div className="mb-6">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-amber-900">No Reviews Available</p>
                    <p className="text-xs text-amber-700">
                      No reviews in the database yet. Click "Update Reviews" to load data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.slice(0, visibleCount).map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                layout
                className="bg-[#f5f5f5] rounded-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    {review.profile_photo_url ? (
                      <img
                        src={review.profile_photo_url}
                        alt={review.author_name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-[#284E4C] text-lg">{review.author_name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-5 h-5 ${
                                star <= review.rating
                                  ? "fill-[#FFC107] text-[#FFC107]"
                                  : "fill-gray-300 text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{review.relative_time_description}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                  </div>
                </div>

                {review.property_name && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {review.property_name}
                    </span>
                  </div>
                )}

                <div className="text-[#333333] leading-relaxed">
                  {needsTruncation(review.text) && !expandedReviews.has(review.id) ? (
                    <>
                      <p className="inline">{review.text.slice(0, 200)}...</p>
                      <button
                        onClick={() => toggleReviewExpansion(review.id)}
                        className="inline-block ml-2 text-[#284E4C] hover:text-[#1e3a39] font-medium text-sm transition-colors"
                      >
                        Read more
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="inline">{review.text}</p>
                      {needsTruncation(review.text) && (
                        <button
                          onClick={() => toggleReviewExpansion(review.id)}
                          className="inline-block ml-2 text-[#284E4C] hover:text-[#1e3a39] font-medium text-sm transition-colors"
                        >
                          Show less
                        </button>
                      )}
                    </>
                  )}
                </div>

              </motion.div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              {reviews.length === 0 ? (
                <>
                  <p className="text-gray-500 text-lg mb-2">No reviews available</p>
                  <p className="text-gray-400 text-sm mb-6">Click the button above to fetch reviews from the API</p>
                  <Button
                    onClick={syncReviewsFromGoSign}
                    disabled={syncing}
                    className="bg-[#284E4C] hover:bg-[#1e3a39] text-white"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Fetching reviews...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Fetch Reviews Now
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-gray-500 text-lg">No reviews found matching your criteria.</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setRatingFilter("all")
                      setPropertyFilter("all")
                      setVisibleCount(10)
                    }}
                    className="mt-4 bg-[#284E4C] hover:bg-[#1e3a39] text-white"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Load More Button */}
          {filteredReviews.length > visibleCount && (
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <button 
                onClick={loadMoreReviews}
                className="px-8 py-3 bg-white border-2 border-[#284E4C] text-[#284E4C] font-medium rounded-md hover:bg-[#284E4C] hover:text-white transition-all"
              >
                Load More Reviews ({filteredReviews.length - visibleCount} remaining)
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#284E4C] text-white">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <img 
                src="https://lsmvmmgkpbyqhthzdexc.supabase.co/storage/v1/object/public/website/Uploads/White_V3%20Symbol%20%26%20Wordmark.png"
                alt="The Flex"
                className="h-10 mb-4"
              />
              <p className="text-gray-300 text-sm">
                Premium serviced apartments for modern living
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link href="/" className="hover:text-white transition">Home</Link></li>
                <li><Link href="/properties" className="hover:text-white transition">Properties</Link></li>
                <li><Link href="/admin" className="hover:text-white transition">Admin Dashboard</Link></li>
                <li><Link href="/google-reviews" className="hover:text-white transition">Google Reviews</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Review Sources</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google Reviews
                </li>
                <li>Hostaway Reviews</li>
                <li>Direct Feedback</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>info@theflex.global</li>
                <li>+44 77 2374 5646</li>
                <li>London, UK</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm text-gray-300">
            <p>© 2024 The Flex. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
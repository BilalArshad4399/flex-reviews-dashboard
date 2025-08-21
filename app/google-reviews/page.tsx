"use client"

import { useEffect, useState } from "react"
import { Star, MapPin, Calendar, User, ExternalLink } from "lucide-react"
import Link from "next/link"
import { FlexLogo } from "@/components/flex-logo"

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
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
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

    setFilteredReviews(filtered)
  }, [reviews, searchTerm, ratingFilter, propertyFilter])

  const uniqueProperties = Array.from(
    new Set(reviews.map((review) => review.property_name).filter(Boolean))
  ).sort()

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0"

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length * 100) : 0
  }))

  useEffect(() => {
    fetchGoogleReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--flex-primary)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--flex-background)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4285F4] to-[#34A853] border-b border-[var(--border)] px-6 py-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <FlexLogo size="large" variant="light" />
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/reviews" className="text-white/80 hover:text-white transition-colors">
              Guest Reviews
            </Link>
            <Link href="/google-reviews" className="text-white font-semibold">
              Google Reviews
            </Link>
            <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-10 h-10" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
              <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
              <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
            </svg>
            <h1 className="text-4xl font-bold text-[var(--flex-primary)]">
              Google Reviews
            </h1>
          </div>
          <p className="text-xl text-[var(--flex-text)] max-w-2xl mx-auto">
            What our guests are saying about Flex Living on Google
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold text-[var(--flex-primary)]">{averageRating}</p>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(parseFloat(averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-3xl font-bold text-[var(--flex-primary)]">{reviews.length}</p>
              </div>
              <User className="w-8 h-8 text-[var(--flex-primary)]" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">5-Star Reviews</p>
                <p className="text-3xl font-bold text-[var(--flex-primary)]">
                  {reviews.filter(r => r.rating === 5).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reviews.length > 0 
                    ? `${((reviews.filter(r => r.rating === 5).length / reviews.length) * 100).toFixed(0)}%`
                    : '0%'
                  }
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Properties</p>
                <p className="text-3xl font-bold text-[var(--flex-primary)]">{uniqueProperties.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-[var(--flex-primary)]" />
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#4285F4] to-[#34A853] h-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--flex-primary)]"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--flex-primary)]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
            </select>
            {uniqueProperties.length > 0 && (
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--flex-primary)]"
              >
                <option value="all">All Properties</option>
                {uniqueProperties.map(property => (
                  <option key={property} value={property}>{property}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {review.profile_photo_url ? (
                    <img
                      src={review.profile_photo_url}
                      alt={review.author_name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.author_name}</h4>
                    <p className="text-xs text-gray-500">{review.relative_time_description}</p>
                  </div>
                </div>
                {review.author_url && (
                  <a
                    href={review.author_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4285F4] hover:text-[#34A853] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {review.property_name && (
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>{review.property_name}</span>
                </div>
              )}

              <p className="text-gray-700 text-sm line-clamp-4">{review.text}</p>
            </div>
          ))}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}
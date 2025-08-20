"use client"

import { useEffect, useState } from "react"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewsFilter } from "@/components/reviews/reviews-filter"
import { ReviewsSummary } from "@/components/reviews/reviews-summary"
import { Button } from "@/components/ui/button"
import { RefreshCw, Star } from "lucide-react"
import Link from "next/link"
import type { NormalizedReview } from "@/lib/types"
import { FlexLogo } from "@/components/flex-logo"

export default function ReviewsPage() {
  const [allReviews, setAllReviews] = useState<NormalizedReview[]>([])
  const [filteredReviews, setFilteredReviews] = useState<NormalizedReview[]>([])
  const [loading, setLoading] = useState(true)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [propertyFilter, setPropertyFilter] = useState("all")

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/reviews/hostaway")
      const data = await response.json()

      if (data.success) {
        // Filter for approved reviews (check both approval object and approved field)
        const approvedReviews = data.data.filter(
          (review: any) => review.approved === true || review.approval?.is_approved === true,
        )
        setAllReviews(approvedReviews)
        setFilteredReviews(approvedReviews)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = allReviews

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (review) =>
          review.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.public_review.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.listing_name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Rating filter
    if (ratingFilter !== "all") {
      const minRating = Number.parseInt(ratingFilter)
      filtered = filtered.filter((review) => review.rating && review.rating >= minRating)
    }

    // Property filter
    if (propertyFilter !== "all") {
      filtered = filtered.filter((review) => review.listing_name === propertyFilter)
    }

    setFilteredReviews(filtered)
  }, [allReviews, searchTerm, ratingFilter, propertyFilter])

  const resetFilters = () => {
    setSearchTerm("")
    setRatingFilter("all")
    setPropertyFilter("all")
  }

  const uniqueProperties = Array.from(new Set(allReviews.map((review) => review.listing_name))).sort()

  useEffect(() => {
    fetchReviews()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--flex-background)]">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          {/* Top Navigation */}
          <div className="bg-gradient-to-r from-[#284E4C] to-[#1e3a39] border-b border-[var(--border)] px-6 py-4 mb-8 shadow-lg">
            <div className="container mx-auto flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <FlexLogo size="large" variant="light" />
              </Link>
              <nav className="flex items-center gap-6">
                <Link href="/" className="text-white/80 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/reviews" className="text-white font-semibold">
                  Reviews
                </Link>
                <Link href="https://theflex.global" className="text-white/80 hover:text-white transition-colors">
                  Main Site
                </Link>
              </nav>
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="text-center py-12">
            <h1 className="text-5xl font-bold text-[var(--flex-primary)] mb-4">
              Guest Reviews
            </h1>
            <p className="text-xl text-[var(--flex-text)] max-w-2xl mx-auto">
              Real experiences from our valued guests across Flex Living properties
            </p>
          </div>
        </div>

        {/* Summary Stats with better layout */}
        <div className="mb-10">
          <ReviewsSummary reviews={allReviews} />
        </div>

        {/* Filters Section */}
        <div className="mb-8">
          <ReviewsFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            ratingFilter={ratingFilter}
            onRatingChange={setRatingFilter}
            propertyFilter={propertyFilter}
            onPropertyChange={setPropertyFilter}
            properties={uniqueProperties}
            onReset={resetFilters}
          />
        </div>

        {/* Results Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-[var(--flex-primary)]">
              {filteredReviews.length} Review{filteredReviews.length !== 1 ? "s" : ""}
              {searchTerm || ratingFilter !== "all" || propertyFilter !== "all" ? " (filtered)" : ""}
            </h2>
            {filteredReviews.length > 0 && (
              <span className="text-[var(--flex-text)]">
                Showing verified guest reviews
              </span>
            )}
          </div>
        </div>

        {/* Reviews List with improved layout */}
        {filteredReviews.length > 0 ? (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-6 flex-shadow hover:flex-shadow-lg transition-all">
                <ReviewCard review={review} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl flex-shadow">
            <div className="w-16 h-16 bg-[var(--flex-cream)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-[var(--flex-primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-[var(--flex-primary)] mb-2">No reviews found</h3>
            <p className="text-[var(--flex-text)] mb-4">
              {searchTerm || ratingFilter !== "all" || propertyFilter !== "all"
                ? "Try adjusting your filters to see more reviews."
                : "No approved reviews are available at the moment."}
            </p>
            {(searchTerm || ratingFilter !== "all" || propertyFilter !== "all") && (
              <Button 
                onClick={resetFilters} 
                variant="outline"
                className="border-[var(--flex-primary)] text-[var(--flex-primary)] hover:bg-[var(--flex-primary)] hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-b from-white to-[var(--flex-cream)] border-t border-[var(--border)] mt-16">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <FlexLogo size="large" className="mx-auto md:mx-0 mb-4" />
              <p className="text-[var(--flex-text)] leading-relaxed mb-4">
                Premium flexible living spaces across the globe. Experience comfort, convenience, and community.
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-[var(--flex-primary)] rounded-full flex items-center justify-center hover:bg-[var(--flex-green-dark)] transition-colors cursor-pointer">
                  <span className="text-white text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-[var(--flex-primary)] mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="https://theflex.global" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Main Website
                  </Link>
                </li>
                <li>
                  <Link href="/reviews" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Guest Reviews
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="https://theflex.global/properties" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                    Properties
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold text-[var(--flex-primary)] mb-4">Get in Touch</h4>
              {/* CTA Button */}
              <div className="mt-6">
                <Link 
                  href="https://theflex.global"
                  className="inline-flex items-center gap-2 bg-[var(--flex-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--flex-green-dark)] transition-colors font-medium"
                >
                  <span>Book Your Stay</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[var(--flex-text)] text-sm">
              © 2024 Flex Living. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="https://theflex.global/privacy" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="https://theflex.global/terms" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Terms of Service
              </Link>
              <Link href="https://theflex.global/cookies" className="text-[var(--flex-text)] hover:text-[var(--flex-primary)] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

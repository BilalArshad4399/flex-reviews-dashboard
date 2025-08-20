"use client"

import { Star } from "lucide-react"
import type { NormalizedReview } from "@/lib/types"

interface ReviewCardProps {
  review: NormalizedReview
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex items-start gap-4">
      {/* Avatar */}
      <div className="w-12 h-12 bg-[var(--flex-cream)] rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-semibold text-[var(--flex-primary)]">{getInitials(review.guest_name)}</span>
      </div>

      <div className="flex-1 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--flex-primary)]">{review.guest_name}</h3>
            <p className="text-sm text-[var(--flex-text)]">{formatDate(review.submitted_at)}</p>
          </div>
          {review.rating && (
            <div className="flex items-center gap-1 bg-[var(--flex-cream)] px-3 py-1 rounded-full">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-[var(--flex-primary)]">{review.rating}</span>
              <span className="text-sm text-[var(--flex-text)]">/10</span>
            </div>
          )}
        </div>

        {/* Review Text */}
        <p className="text-[var(--flex-text)] leading-relaxed">{review.public_review}</p>

        {/* Category Ratings */}
        {review.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.categories.map((category) => (
              <span 
                key={category.category} 
                className="text-xs bg-[var(--flex-cream)] text-[var(--flex-primary)] border-[var(--border)] px-2 py-1 rounded"
              >
                {category.category.replace("_", " ")}: {category.rating}/10
              </span>
            ))}
          </div>
        )}

        {/* Property Name */}
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--flex-text)]">
            <span className="font-medium text-[var(--flex-primary)]">Property:</span> {review.listing_name}
          </p>
        </div>
      </div>
    </div>
  )
}

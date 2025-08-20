// Types for Hostaway API integration and review management

export interface HostawayReviewCategory {
  category: string
  rating: number
}

export interface HostawayReview {
  id: number
  type: string
  status: string
  rating: number | null
  publicReview: string
  reviewCategory: HostawayReviewCategory[]
  submittedAt: string
  guestName: string
  listingName: string
}

export interface HostawayApiResponse {
  status: string
  result: HostawayReview[]
}

export interface NormalizedReview {
  id: number
  hostaway_id: number
  type: string
  status: string
  rating: number | null
  public_review: string
  guest_name: string
  listing_name: string
  submitted_at: Date
  categories: ReviewCategory[]
  approval?: ReviewApproval
}

export interface ReviewCategory {
  category: string
  rating: number
}

export interface ReviewApproval {
  is_approved: boolean
  is_restricted?: boolean
  approved_by?: string
  approved_at?: Date
  rejection_reason?: string
}

export interface ReviewFilters {
  listing?: string
  rating?: number
  category?: string
  status?: "approved" | "pending" | "rejected" | "restricted"
  dateFrom?: string
  dateTo?: string
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  approvedReviews: number
  pendingReviews: number
  rejectedReviews: number
  categoryAverages: Record<string, number>
  categoryBreakdown: Array<{ category: string; count: number }>
  ratingDistribution: Array<{ rating: string; count: number }>
  monthlyTrends: Array<{ month: string; count: number; averageRating: number }>
}

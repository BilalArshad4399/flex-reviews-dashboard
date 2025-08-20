import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export interface DatabaseReview {
  id: number
  hostaway_id: string
  guest_name: string
  listing_name: string
  rating: number
  comment: string
  submitted_at: string
  created_at: string
  updated_at: string
  review_categories: {
    category: string
    rating: number
  }[]
  review_approvals: {
    status: "pending" | "approved" | "restricted"
    approved_by: string | null
    approved_at: string | null
    restriction_reason: string | null
  }[]
}

export interface NormalizedReview {
  id: number
  guest_name: string
  listing_name: string
  rating: number
  comment: string
  submitted_at: string
  categories: {
    category: string
    rating: number
  }[]
  approval: {
    is_approved: boolean
    is_restricted: boolean
  }
  status: "pending" | "approved" | "restricted"
}

export function normalizeReview(dbReview: DatabaseReview): NormalizedReview {
  const approval = dbReview.review_approvals[0] || {
    status: "pending",
    approved_by: null,
    approved_at: null,
    restriction_reason: null,
  }

  return {
    id: dbReview.id,
    guest_name: dbReview.guest_name,
    listing_name: dbReview.listing_name,
    rating: dbReview.rating,
    comment: dbReview.comment,
    submitted_at: dbReview.submitted_at,
    categories: dbReview.review_categories || [],
    approval: {
      is_approved: approval.status === "approved",
      is_restricted: approval.status === "restricted",
    },
    status: approval.status,
  }
}

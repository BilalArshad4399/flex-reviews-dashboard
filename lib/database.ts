// Database utilities for Supabase integration
// This file is kept for backwards compatibility and potential future use
// All database operations are now handled through Supabase

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// Export for any components that might still reference this
export const db = {
  // Placeholder methods that redirect to Supabase
  async getAllReviews() {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        listings!inner(*),
        review_categories(*)
      `)
      .order("submitted_at", { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getReviewById(id: number) {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        listings!inner(*),
        review_categories(*)
      `)
      .eq("id", id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateReviewStatus(id: number, approved: boolean) {
    const { data, error } = await supabase
      .from("reviews")
      .update({ 
        approved,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()
    
    if (error) throw error
    return !!data
  }
}

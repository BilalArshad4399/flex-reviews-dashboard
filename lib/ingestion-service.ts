import { createClient } from "@supabase/supabase-js"
import hostawayReviews from "../fixtures/hostaway_reviews.json"
import crypto from "crypto"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface HostawayReview {
  id: number
  type: "host-to-guest" | "guest-to-host"
  status: string
  rating: number | null
  publicReview: string
  reviewCategory: Array<{
    category: string
    rating: number
  }>
  submittedAt: string
  guestName: string
  listingName: string
}

interface HostawayResponse {
  status: string
  result: HostawayReview[]
}

export class ReviewIngestionService {
  async ingestReviews(): Promise<{ success: boolean; message: string; processed: number; skipped: number; updated: number }> {
    try {

      const data = hostawayReviews as HostawayResponse

      if (data.status !== "success" || !Array.isArray(data.result)) {
        throw new Error("Invalid JSON structure")
      }

      let processedCount = 0
      let skippedCount = 0
      let updatedCount = 0
      let errorCount = 0
      const errors: string[] = []

      for (const review of data.result) {
        try {
          const result = await this.processReview(review)
          if (result === 'created') {
            processedCount++
          } else if (result === 'updated') {
            updatedCount++
          } else if (result === 'skipped') {
            skippedCount++
          }
        } catch (error) {
          errorCount++
          const errorMsg = `Review ${review.id}: ${error instanceof Error ? error.message : String(error)}`
          errors.push(errorMsg)
        }
      }

      
      if (errorCount > 0) {
      }

      return {
        success: errorCount === 0,
        message: errorCount === 0 
          ? `Successfully synced: ${processedCount} new, ${updatedCount} updated, ${skippedCount} unchanged`
          : `Synced with errors: ${processedCount} new, ${updatedCount} updated, ${skippedCount} unchanged, ${errorCount} errors`,
        processed: processedCount,
        skipped: skippedCount,
        updated: updatedCount,
      }
    } catch (error) {
      console.error("Ingestion error:", error)
      return {
        success: false,
        message: `Ingestion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        processed: 0,
        skipped: 0,
        updated: 0,
      }
    }
  }

  private calculateContentHash(review: HostawayReview): string {
    // Create a deterministic string from review content
    const contentString = JSON.stringify({
      id: review.id,
      type: review.type,
      rating: review.rating,
      publicReview: review.publicReview,
      reviewCategory: review.reviewCategory,
      submittedAt: review.submittedAt,
      guestName: review.guestName,
      listingName: review.listingName,
    })
    
    // Generate SHA256 hash
    return crypto.createHash('sha256').update(contentString).digest('hex')
  }

  private async processReview(review: HostawayReview): Promise<'created' | 'updated' | 'skipped'> {
    const listingExternalId = this.generateListingId(review.listingName)
    const contentHash = this.calculateContentHash(review)

    // First, check if review exists and if hash has changed
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("id, content_hash, status, approved")
      .eq("external_id", review.id.toString())
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing review:", checkError)
      throw checkError
    }

    // If review exists and hash hasn't changed, skip it
    if (existingReview && existingReview.content_hash === contentHash) {
      return 'skipped'
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .upsert(
        {
          name: review.listingName,
          external_id: listingExternalId,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "external_id",
        },
      )
      .select()
      .single()

    if (listingError) {
      console.error("Listing upsert error:", listingError)
      throw listingError
    }

    // Prepare review data
    const reviewData = {
      external_id: review.id.toString(),
      listing_id: listing.id,
      type: review.type,
      overall_rating: review.rating,
      public_review: review.publicReview,
      submitted_at: new Date(review.submittedAt).toISOString(),
      guest_name: review.guestName,
      source: "hostaway",
      content_hash: contentHash,
      updated_at: new Date().toISOString(),
    }

    // If it's a new review, set it to pending
    if (!existingReview) {
      Object.assign(reviewData, {
        status: "pending",
        approved: null,
      })
    }
    // If it's an existing review being updated, preserve its approval status
    // Only update the content fields, not the approval status

    const { data: upsertedReview, error: reviewError } = await supabase
      .from("reviews")
      .upsert(reviewData, { onConflict: "external_id" })
      .select()
      .single()

    if (reviewError) {
      console.error("Review upsert error:", reviewError)
      throw new Error(`Database error: ${reviewError.message || reviewError}`)
    }

    // Update categories
    await supabase.from("review_categories").delete().eq("review_id", upsertedReview.id)

    if (review.reviewCategory && review.reviewCategory.length > 0) {
      const categories = review.reviewCategory.map((cat) => ({
        review_id: upsertedReview.id,
        category: cat.category,
        rating: cat.rating,
      }))

      const { error: categoriesError } = await supabase.from("review_categories").insert(categories)

      if (categoriesError) {
        console.error("Categories insert error:", categoriesError)
        throw categoriesError
      }
    }

    return existingReview ? 'updated' : 'created'
  }

  private generateListingId(listingName: string): string {
    // Generate a consistent external_id from listing name
    return listingName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
  }

  async getIngestionStats(): Promise<{
    totalListings: number
    totalReviews: number
    approvedReviews: number
    pendingReviews: number
  }> {
    const [listingsResult, reviewsResult, approvedResult] = await Promise.all([
      supabase.from("listings").select("id", { count: "exact" }),
      supabase.from("reviews").select("id", { count: "exact" }),
      supabase.from("reviews").select("id", { count: "exact" }).eq("approved", true),
    ])

    return {
      totalListings: listingsResult.count || 0,
      totalReviews: reviewsResult.count || 0,
      approvedReviews: approvedResult.count || 0,
      pendingReviews: (reviewsResult.count || 0) - (approvedResult.count || 0),
    }
  }
}

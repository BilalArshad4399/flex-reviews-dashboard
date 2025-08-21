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
    // Sort keys to ensure consistent hash regardless of property order
    const contentObj = {
      id: review.id,
      type: review.type,
      rating: review.rating === null ? 'null' : review.rating, // Handle null explicitly
      publicReview: review.publicReview,
      reviewCategory: review.reviewCategory ? JSON.stringify(review.reviewCategory.sort((a, b) => a.category.localeCompare(b.category))) : '[]',
      submittedAt: review.submittedAt,
      guestName: review.guestName,
      listingName: review.listingName,
    }
    
    const contentString = JSON.stringify(contentObj)
    
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
      .maybeSingle()

    if (checkError) {
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
      throw listingError
    }

    // Prepare review data
    const submittedDate = new Date(review.submittedAt).toISOString()
    
    const reviewData: any = {
      external_id: review.id.toString(),
      listing_id: listing.id,
      type: review.type,
      public_review: review.publicReview,
      submitted_at: submittedDate,
      guest_name: review.guestName,
      source: "hostaway",
      content_hash: contentHash,
      updated_at: new Date().toISOString(),
    }
    
    // Only include rating if it's not null
    if (review.rating !== null) {
      reviewData.overall_rating = review.rating
    }

    // If it's a new review, set it to pending
    if (!existingReview) {
      reviewData.status = "pending"
      reviewData.approved = null
    } else {
      // If it's an existing review being updated, preserve its status and approval
      reviewData.status = existingReview.status || "pending"
      reviewData.approved = existingReview.approved
    }

    const { data: upsertedReview, error: reviewError } = await supabase
      .from("reviews")
      .upsert(reviewData, { onConflict: "external_id" })
      .select()
      .single()

    if (reviewError) {
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

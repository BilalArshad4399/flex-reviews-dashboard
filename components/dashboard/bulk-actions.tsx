"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle } from "lucide-react"
import type { NormalizedReview } from "@/lib/types"

interface BulkActionsProps {
  selectedReviews: number[]
  reviews: NormalizedReview[]
  onBulkApprove: (reviewIds: number[], approved: boolean, reason?: string, isRestricted?: boolean) => void
  onSelectAll: (selected: boolean) => void
  onClearSelection: () => void
}

export function BulkActions({
  selectedReviews,
  reviews,
  onBulkApprove,
  onSelectAll,
  onClearSelection,
}: BulkActionsProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const allSelected = selectedReviews.length === reviews.length && reviews.length > 0
  const someSelected = selectedReviews.length > 0
  
  // Get selected review objects
  const selectedReviewObjects = reviews.filter(review => selectedReviews.includes(review.id))
  
  // Check if any selected reviews can be approved (not already approved)
  const canApprove = selectedReviewObjects.some(review => 
    review.approval?.is_approved !== true && review.status !== "approved"
  )
  
  // Check if any selected reviews can be rejected/restricted (not already restricted)
  const canReject = selectedReviewObjects.some(review => 
    review.approval?.is_restricted !== true && review.status !== "restricted"
  )
  
  // Debug logging
  console.log('[BulkActions] Debug:', {
    selectedReviews: selectedReviews.length,
    selectedReviewObjects: selectedReviewObjects.length,
    canApprove,
    canReject,
    reviewStatuses: selectedReviewObjects.map(r => ({
      id: r.id,
      isApproved: r.approval?.is_approved,
      isRestricted: r.approval?.is_restricted
    }))
  })

  const handleBulkReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for bulk restriction")
      return
    }
    // Only restrict reviews that aren't already restricted
    const reviewsToRestrict = selectedReviews.filter(id => {
      const review = selectedReviewObjects.find(r => r.id === id)
      return review?.approval?.is_restricted !== true
    })
    onBulkApprove(reviewsToRestrict, false, rejectionReason, true) // true for isRestricted
    setRejectionReason("")
    setShowRejectDialog(false)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--flex-cream)]/30 rounded-lg border border-[var(--border)]">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={allSelected}
          onCheckedChange={(checked) => onSelectAll(!!checked)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-sm font-medium">
          {someSelected ? `${selectedReviews.length} selected` : "Select all"}
        </span>
      </div>

      {someSelected && (
        <div className="flex items-center gap-3 flex-wrap">
          {canApprove && (
            <Button
              size="sm"
              onClick={() => onBulkApprove(selectedReviews.filter(id => {
                const review = selectedReviewObjects.find(r => r.id === id)
                return review?.approval?.is_approved !== true
              }), true)}
              className="bg-[var(--flex-primary)] hover:bg-[var(--flex-green-dark)] text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve ({selectedReviewObjects.filter(r => r.approval?.is_approved !== true).length})
            </Button>
          )}

          {canReject && (
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 bg-white"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Restrict ({selectedReviewObjects.filter(r => r.approval?.is_restricted !== true).length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Restrict Reviews</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You are about to restrict {selectedReviewObjects.filter(r => r.approval?.is_restricted !== true).length} review{selectedReviewObjects.filter(r => r.approval?.is_restricted !== true).length !== 1 ? "s" : ""}.
                    Please provide a reason for this action.
                  </p>
                  <Textarea
                    placeholder="Reason for restriction..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleBulkReject}
                      className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
                    >
                      Restrict Reviews
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {!canApprove && !canReject && (
            <span className="text-sm text-[var(--flex-text)] px-3 py-1 bg-[var(--flex-cream)] rounded border">
              All selected reviews already processed
            </span>
          )}

          <Button size="sm" variant="outline" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </div>
      )}
    </div>
  )
}

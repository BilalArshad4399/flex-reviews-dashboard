"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle, Clock, Star, Eye } from "lucide-react"
import type { NormalizedReview } from "@/lib/types"

interface ReviewsTableProps {
  reviews: NormalizedReview[]
  onApprove: (reviewId: number, approved: boolean, reason?: string, isRestricted?: boolean) => void
  selectedReviews?: number[]
  onSelectionChange?: (selected: number[]) => void
}

export function ReviewsTable({ reviews, onApprove, selectedReviews = [], onSelectionChange }: ReviewsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const [selectedReview, setSelectedReview] = useState<NormalizedReview | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [updatingReviews, setUpdatingReviews] = useState<Set<number>>(new Set())

  // Use reviews directly instead of maintaining local state
  const localReviews = reviews

  console.log("[v0] ReviewsTable received reviews:", reviews.length)
  if (reviews.length > 0) {
    console.log("[v0] Sample review structure:", JSON.stringify(reviews[0], null, 2))
  }

  const filteredReviews = localReviews.filter((review) => {
    const matchesSearch =
      (review.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.listing_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (review.public_review?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesStatus = (() => {
      if (statusFilter === "all") return true

      const isApproved = review.approval?.is_approved === true || review.status === "approved"
      const isRestricted = review.approval?.is_restricted === true || review.status === "restricted"
      const isPending = (!isApproved && !isRestricted) || review.status === "pending"

      console.log("[v0] Review", review.id, "status check:", {
        statusFilter,
        isApproved,
        isRestricted,
        isPending,
        reviewStatus: review.status,
        approval: review.approval,
      })

      switch (statusFilter) {
        case "approved":
          return isApproved && !isRestricted
        case "pending":
          return isPending
        case "restricted":
          return isRestricted
        default:
          return true
      }
    })()

    const matchesRating = ratingFilter === "all" || (review.rating && review.rating.toString() === ratingFilter)

    const matches = matchesSearch && matchesStatus && matchesRating
    console.log("[v0] Review", review.id, "filter result:", { matchesSearch, matchesStatus, matchesRating, matches })

    return matches
  })

  console.log("[v0] Filtered reviews count:", filteredReviews.length)

  const getStatusBadge = (review: NormalizedReview) => {
    const isRestricted = review.approval?.is_restricted || review.status === "restricted"
    const isApproved = review.approval?.is_approved || review.status === "approved"

    if (isRestricted) {
      return (
        <Badge
          variant="destructive"
          className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:from-red-600 hover:to-red-700"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Restricted
        </Badge>
      )
    }
    if (isApproved) {
      return (
        <Badge
          variant="default"
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      )
    }
    return (
      <Badge
        variant="secondary"
        className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200"
      >
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    )
  }

  const handleStatusChange = async (review: NormalizedReview, status: "approved" | "restricted" | "pending") => {
    if (status === "restricted" && !rejectionReason.trim()) {
      alert("Please provide a reason for restricting this review")
      return
    }

    const isApproved = status === "approved"
    const isRestricted = status === "restricted"

    setUpdatingReviews((prev) => new Set(prev).add(review.id))

    const updatedReview = {
      ...review,
      approval: {
        is_approved: isApproved,
        is_restricted: isRestricted,
        reason: isRestricted ? rejectionReason : undefined,
        updated_at: new Date().toISOString(),
      },
    }

    // Update will be handled by parent component through props
    try {
      await onApprove(review.id, isApproved, isRestricted ? rejectionReason : undefined, isRestricted)
      console.log("[v0] Status updated successfully for review", review.id)
    } catch (error) {
      console.error("[v0] Failed to update status:", error)
      alert("Failed to update review status. Please try again.")
    } finally {
      setUpdatingReviews((prev) => {
        const newSet = new Set(prev)
        newSet.delete(review.id)
        return newSet
      })
    }

    setSelectedReview(null)
    setRejectionReason("")
  }

  const handleRowSelection = (reviewId: number, checked: boolean) => {
    if (!onSelectionChange) return

    if (checked) {
      onSelectionChange([...selectedReviews, reviewId])
    } else {
      onSelectionChange(selectedReviews.filter((id) => id !== reviewId))
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-card to-card/50">
      <CardHeader className="space-y-4">
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
          Reviews Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search reviews, guests, or properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-0"
          />
          <div className="flex gap-2 flex-shrink-0">
            <div className="relative">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="restricted">Restricted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-36 bg-white border-gray-200 shadow-sm">
                  <SelectValue placeholder="All Ratings" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All Ratings</SelectItem>
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-200/50 bg-gray-50/50">
                {onSelectionChange && <TableHead className="w-12 px-4">Select</TableHead>}
                <TableHead className="px-4">Guest</TableHead>
                <TableHead className="px-4">Property</TableHead>
                <TableHead className="px-4">Rating</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Date</TableHead>
                <TableHead className="px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {reviews.length === 0 ? "No reviews available" : "No reviews match the current filters"}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow
                    key={review.id}
                    className={`border-gray-200/30 hover:bg-gray-50/50 transition-colors ${
                      updatingReviews.has(review.id) ? "opacity-70" : ""
                    }`}
                  >
                    {onSelectionChange && (
                      <TableCell className="px-4">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedReviews.includes(review.id)}
                            onCheckedChange={(checked) => handleRowSelection(review.id, !!checked)}
                            className="w-5 h-5 border-2 border-emerald-400 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-emerald-500 data-[state=checked]:to-emerald-600 data-[state=checked]:border-emerald-500 shadow-sm hover:shadow-md transition-all duration-200 hover:border-emerald-500 hover:scale-105"
                          />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium px-4">{review.guest_name}</TableCell>
                    <TableCell className="px-4 max-w-xs truncate" title={review.listing_name}>
                      {review.listing_name}
                    </TableCell>
                    <TableCell className="px-4">
                      {review.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">{getStatusBadge(review)}</TableCell>
                    <TableCell className="px-4 text-sm text-gray-600">
                      {new Date(review.submitted_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReview(review)}
                              className="hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                              disabled={updatingReviews.has(review.id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-gray-900">Review Details</DialogTitle>
                            </DialogHeader>
                            {selectedReview && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Guest</label>
                                    <p className="text-gray-900 font-medium">{selectedReview.guest_name}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Property</label>
                                    <p className="text-gray-900">{selectedReview.listing_name}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Overall Rating</label>
                                    <p className="flex items-center gap-1">
                                      {selectedReview.rating ? (
                                        <>
                                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                          <span className="font-medium">{selectedReview.rating}/10</span>
                                        </>
                                      ) : (
                                        "N/A"
                                      )}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Date</label>
                                    <p className="text-gray-900">
                                      {new Date(selectedReview.submitted_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-gray-700">Review</label>
                                  <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-gray-900 leading-relaxed">{selectedReview.public_review}</p>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <label className="text-sm font-medium text-gray-700">Category Ratings</label>
                                  <div className="grid grid-cols-2 gap-3">
                                    {selectedReview.categories.map((cat) => (
                                      <div
                                        key={cat.category}
                                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                                      >
                                        <span className="capitalize font-medium text-gray-700">
                                          {cat.category.replace("_", " ")}
                                        </span>
                                        <span className="font-semibold text-emerald-600">{cat.rating}/10</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                      Reason (required for restriction)
                                    </label>
                                    <Textarea
                                      placeholder="Provide a reason for restriction..."
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      className="min-h-[80px] border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                                    />
                                  </div>
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleStatusChange(selectedReview, "approved")}
                                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={updatingReviews.has(selectedReview.id) || selectedReview.approval?.is_approved === true}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      {selectedReview.approval?.is_approved ? "Already Approved" : 
                                       updatingReviews.has(selectedReview.id) ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleStatusChange(selectedReview, "pending")}
                                      className="border-yellow-400 text-yellow-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={updatingReviews.has(selectedReview.id)}
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      Set Pending
                                    </Button>
                                    <Button
                                      variant="outline"
                                      onClick={() => handleStatusChange(selectedReview, "restricted")}
                                      className="border-red-400 text-red-600 hover:bg-red-50 hover:border-red-500 hover:text-red-700 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      disabled={updatingReviews.has(selectedReview.id) || selectedReview.approval?.is_restricted === true}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      {selectedReview.approval?.is_restricted ? "Already Restricted" : "Restrict"}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

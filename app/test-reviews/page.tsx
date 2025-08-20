"use client"

import { useEffect, useState } from "react"

export default function TestReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/reviews")
      .then(res => res.json())
      .then(data => {
        console.log("API Response:", data)
        if (data.success && data.data) {
          setReviews(data.data)
        } else {
          setError(data.error || "Failed to fetch reviews")
        }
      })
      .catch(err => {
        console.error("Fetch error:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Reviews Page</h1>
      <p className="mb-4">Total reviews: {reviews.length}</p>
      
      <div className="space-y-4">
        {reviews.map((review, index) => (
          <div key={review.id || index} className="border p-4 rounded">
            <h3 className="font-bold">{review.guest_name}</h3>
            <p className="text-sm text-gray-600">{review.listing_name}</p>
            <p className="mt-2">{review.public_review}</p>
            <p className="text-sm mt-2">
              Rating: {review.rating || "N/A"} | 
              Status: {review.status} | 
              Approved: {review.approval?.is_approved ? "Yes" : "No"}
            </p>
          </div>
        ))}
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer font-bold">Raw Data</summary>
        <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-xs">
          {JSON.stringify(reviews, null, 2)}
        </pre>
      </details>
    </div>
  )
}
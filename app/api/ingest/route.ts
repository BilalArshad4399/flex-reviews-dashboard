import { NextResponse } from "next/server"
import { ReviewIngestionService } from "../../../lib/ingestion-service"

export async function POST() {
  try {
    const ingestionService = new ReviewIngestionService()
    const result = await ingestionService.ingestReviews()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Ingestion API error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const ingestionService = new ReviewIngestionService()
    const stats = await ingestionService.getIngestionStats()

    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Ingestion stats error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

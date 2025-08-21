import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { approved, rejectionReason, approvedBy, isRestricted } = body


    // Determine the status based on approval and restriction
    let status = 'pending'
    let approvedValue = null
    
    if (isRestricted) {
      status = 'restricted'
      approvedValue = false
    } else if (approved) {
      status = 'approved'
      approvedValue = true
    } else {
      status = 'pending'
      approvedValue = null
    }

    // Update review approval status using new schema
    const { data, error } = await supabase
      .from("reviews")
      .update({
        approved: approvedValue,
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }


    return NextResponse.json({
      success: true,
      message: `Review ${isRestricted ? "restricted" : approved ? "approved" : "set to pending"} successfully`,
      data: {
        reviewId: Number.parseInt(id),
        approved: data.approved,
        status: data.status,
        approvedBy: approvedBy || "Manager",
        approvedAt: new Date().toISOString(),
        rejectionReason: isRestricted ? rejectionReason : undefined,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

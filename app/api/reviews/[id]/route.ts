import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { approved } = body


    // Update review approval status
    const { data, error } = await supabase
      .from("reviews")
      .update({
        approved: approved,
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
      message: `Review ${approved ? "approved" : "unapproved"} successfully`,
      data: {
        id: data.id,
        approved: data.approved,
        updated_at: data.updated_at,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET() {
  const { count, error } = await supabase
    .from("archives")
    .select("id", { count: "exact", head: true })

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ ok: true, archives: count, ts: new Date().toISOString() })
}

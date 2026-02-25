import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .lte("remind_at", now)
    .not("remind_at", "is", null)
    .eq("status", "pending")
    .order("due_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

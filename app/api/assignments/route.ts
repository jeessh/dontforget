import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { defaultRemindAt } from "@/lib/db";

export async function GET(req: NextRequest) {
  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("course_id");
  const status = searchParams.get("status");

  let query = supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .order("due_at", { ascending: true });

  if (courseId) query = query.eq("course_id", courseId);
  if (status)   query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const body = await req.json();
  const { course_id, title, type = "assignment", due_at, weight, description = "" } = body;

  if (!course_id) return NextResponse.json({ error: "course_id is required" }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!due_at) return NextResponse.json({ error: "due_at is required" }, { status: 400 });

  const remind_at = body.remind_at !== undefined ? body.remind_at : defaultRemindAt(due_at);

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      course_id,
      title: title.trim(),
      type,
      due_at,
      weight: weight ?? null,
      description,
      status: "pending",
      remind_at,
    })
    .select("*, course:courses(*)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

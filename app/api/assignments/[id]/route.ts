import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface Props { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("assignments")
    .select("*, course:courses(*)")
    .eq("id", id)
    .single();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = getSupabase();
  const body = await req.json();

  // Clearing remind_at when marking done
  const DONE_STATUSES = new Set(["submitted", "completed"]);
  if (body.status && DONE_STATUSES.has(body.status) && !("remind_at" in body)) {
    body.remind_at = null;
  }

  const allowed = ["title", "type", "due_at", "weight", "description", "status", "remind_at"];
  const patch: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) patch[key] = body[key];
  }

  const { data, error } = await supabase
    .from("assignments")
    .update(patch)
    .eq("id", id)
    .select("*, course:courses(*)")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = getSupabase();
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

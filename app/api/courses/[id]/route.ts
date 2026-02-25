import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

interface Props { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params;
  const supabase = getSupabase();
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}

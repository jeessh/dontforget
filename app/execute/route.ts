import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { defaultRemindAt } from "@/lib/db";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, parameters: p = {} } = body as { action: string; parameters: Record<string, unknown> };
  const supabase = getSupabase();

  try {
    // ── list_courses ─────────────────────────────────────────────────────────
    if (action === "list_courses") {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("name");
      if (error) throw error;
      return NextResponse.json({ success: true, data: data ?? [] }, { headers: CORS });
    }

    // ── add_course ────────────────────────────────────────────────────────────
    if (action === "add_course") {
      const { name, code = "", color = "indigo" } = p as {
        name: string; code?: string; color?: string;
      };
      if (!name?.toString().trim()) {
        return NextResponse.json({ success: false, error: "name is required" }, { status: 400, headers: CORS });
      }
      const { data, error } = await supabase
        .from("courses")
        .insert({ name: name.toString().trim(), code: (code ?? "").toString().trim(), color })
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data }, { headers: CORS });
    }

    // ── delete_course ─────────────────────────────────────────────────────────
    if (action === "delete_course") {
      const { id } = p as { id: string };
      if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400, headers: CORS });
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, data: { deleted: true, id } }, { headers: CORS });
    }

    // ── list_assignments ──────────────────────────────────────────────────────
    if (action === "list_assignments") {
      const { course_id, status, upcoming } = p as {
        course_id?: string; status?: string; upcoming?: boolean;
      };
      let query = supabase
        .from("assignments")
        .select("*, course:courses(*)")
        .order("due_at", { ascending: true });
      if (course_id) query = query.eq("course_id", course_id);
      if (status)    query = query.eq("status", status);
      if (upcoming)  query = query.gte("due_at", new Date().toISOString());
      const { data, error } = await query;
      if (error) throw error;
      return NextResponse.json({ success: true, data: data ?? [] }, { headers: CORS });
    }

    // ── get_assignment ────────────────────────────────────────────────────────
    if (action === "get_assignment") {
      const { id } = p as { id: string };
      if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400, headers: CORS });
      const { data, error } = await supabase
        .from("assignments")
        .select("*, course:courses(*)")
        .eq("id", id)
        .single();
      if (error || !data) return NextResponse.json({ success: false, error: "Not found" }, { status: 404, headers: CORS });
      return NextResponse.json({ success: true, data }, { headers: CORS });
    }

    // ── add_assignment ────────────────────────────────────────────────────────
    if (action === "add_assignment") {
      const {
        course_id, title, type = "assignment",
        due_at, weight, description = "",
      } = p as {
        course_id: string; title: string; type?: string;
        due_at: string; weight?: number; description?: string;
      };
      if (!course_id) return NextResponse.json({ success: false, error: "course_id is required" }, { status: 400, headers: CORS });
      if (!title?.toString().trim()) return NextResponse.json({ success: false, error: "title is required" }, { status: 400, headers: CORS });
      if (!due_at) return NextResponse.json({ success: false, error: "due_at is required" }, { status: 400, headers: CORS });

      const remind_at = defaultRemindAt(due_at.toString());
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          course_id, title: title.toString().trim(),
          type, due_at, weight: weight ?? null,
          description, status: "pending", remind_at,
        })
        .select("*, course:courses(*)")
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data }, { headers: CORS });
    }

    // ── update_assignment ─────────────────────────────────────────────────────
    if (action === "update_assignment") {
      const { id, ...rest } = p as { id: string; [k: string]: unknown };
      if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400, headers: CORS });

      const DONE = new Set(["submitted", "completed"]);
      if (rest.status && DONE.has(rest.status as string) && !("remind_at" in rest)) {
        rest.remind_at = null;
      }

      const allowed = ["title", "type", "due_at", "weight", "description", "status", "remind_at"];
      const patch: Record<string, unknown> = {};
      for (const key of allowed) {
        if (key in rest) patch[key] = rest[key];
      }

      const { data, error } = await supabase
        .from("assignments")
        .update(patch)
        .eq("id", id)
        .select("*, course:courses(*)")
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data }, { headers: CORS });
    }

    // ── delete_assignment ─────────────────────────────────────────────────────
    if (action === "delete_assignment") {
      const { id } = p as { id: string };
      if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400, headers: CORS });
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true, data: { deleted: true, id } }, { headers: CORS });
    }

    // ── get_reminders ─────────────────────────────────────────────────────────
    if (action === "get_reminders") {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("assignments")
        .select("*, course:courses(*)")
        .lte("remind_at", now)
        .not("remind_at", "is", null)
        .eq("status", "pending")
        .order("due_at", { ascending: true });
      if (error) throw error;

      // Map to hub reminder shape: { id, role, company, url }
      const reminders = (data ?? []).map((a: Record<string, unknown>) => {
        const course = a.course as Record<string, unknown> | null;
        return {
          id: a.id,
          role: a.title,
          company: course ? ((course.code as string) || (course.name as string)) : "Unknown",
          url: "",
          due_at: a.due_at,
          remind_at: a.remind_at,
        };
      });
      return NextResponse.json({ success: true, data: reminders }, { headers: CORS });
    }

    // ── snooze_reminder ───────────────────────────────────────────────────────
    if (action === "snooze_reminder") {
      const { id } = p as { id: string };
      if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400, headers: CORS });

      // Fetch current remind_at
      const { data: existing, error: fetchErr } = await supabase
        .from("assignments")
        .select("remind_at")
        .eq("id", id)
        .single();
      if (fetchErr || !existing) {
        return NextResponse.json({ success: false, error: "Not found" }, { status: 404, headers: CORS });
      }
      const base = existing.remind_at ? new Date(existing.remind_at) : new Date();
      base.setHours(base.getHours() + 1);

      const { data, error } = await supabase
        .from("assignments")
        .update({ remind_at: base.toISOString() })
        .eq("id", id)
        .select("*, course:courses(*)")
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, data }, { headers: CORS });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400, headers: CORS });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500, headers: CORS });
  }
}

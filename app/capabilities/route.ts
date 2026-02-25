import { NextResponse } from "next/server";
import { COURSE_COLORS, ALL_TYPES, ALL_STATUSES } from "@/lib/db";

export async function GET() {
  return NextResponse.json([
    {
      name: "list_courses",
      description: "List all courses.",
      parameters: [],
    },
    {
      name: "add_course",
      description: "Create a new course.",
      parameters: [
        { name: "name", type: "string", required: true, description: "Course name" },
        { name: "code", type: "string", required: false, description: "Course code (e.g. CS101)" },
        {
          name: "color",
          type: "string",
          required: false,
          description: `Color for the course badge. One of: ${COURSE_COLORS.join(", ")}`,
        },
      ],
    },
    {
      name: "delete_course",
      description: "Delete a course and all its assignments.",
      parameters: [{ name: "id", type: "string", required: true, description: "Course UUID" }],
    },
    {
      name: "list_assignments",
      description: "List assignments, optionally filtered by course, status, or upcoming only.",
      parameters: [
        { name: "course_id", type: "string", required: false, description: "Filter by course UUID" },
        {
          name: "status",
          type: "string",
          required: false,
          description: `Filter by status. One of: ${ALL_STATUSES.join(", ")}`,
        },
        {
          name: "upcoming",
          type: "boolean",
          required: false,
          description: "If true, only return assignments with due_at in the future",
        },
      ],
    },
    {
      name: "get_assignment",
      description: "Get a single assignment by ID.",
      parameters: [{ name: "id", type: "string", required: true, description: "Assignment UUID" }],
    },
    {
      name: "add_assignment",
      description:
        "Create a new assignment. Reminder is automatically set to 3 days before the due date.",
      parameters: [
        { name: "course_id", type: "string", required: true, description: "Course UUID" },
        { name: "title", type: "string", required: true, description: "Assignment title" },
        {
          name: "type",
          type: "string",
          required: false,
          description: `Assignment type. One of: ${ALL_TYPES.join(", ")}`,
        },
        {
          name: "due_at",
          type: "string",
          required: true,
          description: "Due date/time in ISO 8601 format, e.g. 2026-04-15T23:59:00Z",
        },
        {
          name: "weight",
          type: "number",
          required: false,
          description: "Grade weight as a percentage (e.g. 20 for 20%)",
        },
        { name: "description", type: "string", required: false, description: "Optional notes" },
      ],
    },
    {
      name: "update_assignment",
      description: "Update fields on an existing assignment. Marking submitted/completed clears the reminder.",
      parameters: [
        { name: "id", type: "string", required: true, description: "Assignment UUID" },
        { name: "title", type: "string", required: false },
        { name: "type", type: "string", required: false, description: `One of: ${ALL_TYPES.join(", ")}` },
        { name: "due_at", type: "string", required: false, description: "ISO 8601 datetime" },
        { name: "weight", type: "number", required: false },
        { name: "description", type: "string", required: false },
        { name: "status", type: "string", required: false, description: `One of: ${ALL_STATUSES.join(", ")}` },
        { name: "remind_at", type: "string", required: false, description: "ISO 8601 datetime or null to clear" },
      ],
    },
    {
      name: "delete_assignment",
      description: "Delete an assignment.",
      parameters: [{ name: "id", type: "string", required: true, description: "Assignment UUID" }],
    },
    {
      name: "get_reminders",
      description: "Get all pending assignments whose reminder time has passed.",
      parameters: [],
    },
    {
      name: "snooze_reminder",
      description: "Snooze an assignment reminder by 1 hour.",
      parameters: [{ name: "id", type: "string", required: true, description: "Assignment UUID" }],
    },
  ]);
}

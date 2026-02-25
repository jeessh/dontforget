import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    title: "DontForget",
    description:
      "Track school assignment deadlines by course, with automatic 3-day reminders.",
    version: "1.0.0",
    author: "Jesse",
    homepage_url: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  });
}

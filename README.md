# deadline-manager

A Jesseverse extension for tracking school assignment deadlines by course. Courses are color-coded, assignments have types and weights, and reminders are automatically set 3 days before each due date.

## Features

- **Courses** — create courses with a color badge and course code
- **Assignments** — track title, type (assignment/midterm/exam/quiz/project/lab), due date, grade weight, and notes
- **Auto-reminders** — 3-day reminder set automatically when adding an assignment
- **Urgency grouping** — dashboard groups upcoming work into Overdue / Due Today / This Week / Later
- **MCP integration** — full Jesseverse extension protocol with 10 actions
- **Light/dark mode** — academic indigo palette, system preference detected on load

## Stack

Next.js 15 · Supabase · Tailwind CSS · TypeScript

## Running locally

```bash
npm install
npm run dev   # http://localhost:3003
```

Copy `.env.example` → `.env.local` and fill in your Supabase credentials. Run the migrations in `supabase/migrations/` against your Supabase project.

## MCP actions

| Action | Description |
|--------|-------------|
| `list_courses` | All courses |
| `add_course` | Create a course (name, code?, color?) |
| `delete_course` | Delete a course and its assignments |
| `list_assignments` | All assignments — filter by course, status, upcoming |
| `get_assignment` | Single assignment by ID |
| `add_assignment` | Create an assignment — auto-sets 3-day reminder |
| `update_assignment` | Update any field — marks done clears reminder |
| `delete_assignment` | Delete an assignment |
| `get_reminders` | Assignments with expired remind_at |
| `snooze_reminder` | Push reminder forward 1 hour |

## Registering with the hub

Add in the hub with `add_extension` pointing to `http://localhost:3003`.

# DontForget

Another jesseverse app that helps me keep track of school assignments and deadlines so nothing slips through the cracks.

## Functions

**Courses:** create courses with a color badge and course code to keep everything organized

**Assignments:** track title, type, due date, grade weight, and notes for each assignment

**Auto-reminders:** a 3-day reminder is automatically set whenever I add an assignment so I actually see it coming

**Urgency grouping:** dashboard groups everything into Overdue / Due Today / This Week / Later

## MCP actions

| Action | |
|---|---|
| `list_courses` / `add_course` / `delete_course` | Manage courses |
| `list_assignments` / `get_assignment` | Browse and fetch assignments |
| `add_assignment` / `update_assignment` / `delete_assignment` | Manage assignments |
| `get_reminders` / `snooze_reminder` | Manage reminders |

## Registering with the hub

Add in the hub with `add_extension` pointing to `http://localhost:3003`.

-- Assignments: any graded item — homework, midterm, exam, project, etc.
CREATE TABLE IF NOT EXISTS assignments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  type        text        NOT NULL DEFAULT 'assignment',
  -- assignment | midterm | exam | quiz | project | lab | other
  due_at      timestamptz NOT NULL,
  weight      numeric,                        -- percent of final grade, optional
  description text        NOT NULL DEFAULT '',
  status      text        NOT NULL DEFAULT 'pending',
  -- pending | submitted | completed | late
  remind_at   timestamptz,                    -- NULL = no reminder
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assignments_course_id_idx ON assignments(course_id);
CREATE INDEX IF NOT EXISTS assignments_due_at_idx     ON assignments(due_at);
CREATE INDEX IF NOT EXISTS assignments_remind_at_idx  ON assignments(remind_at)
  WHERE remind_at IS NOT NULL;

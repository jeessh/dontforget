-- Courses: one row per class you're enrolled in
CREATE TABLE IF NOT EXISTS courses (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  code       text        NOT NULL DEFAULT '',
  color      text        NOT NULL DEFAULT 'indigo',
  created_at timestamptz NOT NULL DEFAULT now()
);

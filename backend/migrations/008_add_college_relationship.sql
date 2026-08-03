CREATE TABLE colleges (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO colleges (name)
VALUES
  ('DePaul University'),
  ('Illinois Institute of Technology'),
  ('Illinois State University'),
  ('Loyola University Chicago'),
  ('Marquette University'),
  ('Moraine Valley Community College'),
  ('Northwestern University'),
  ('Saint Xavier University'),
  ('University of Chicago'),
  ('University of Illinois Chicago'),
  ('University of Illinois Urbana-Champaign'),
  ('University of Notre Dame')
ON CONFLICT (name) DO NOTHING;

ALTER TABLE users
  ADD COLUMN college_id BIGINT;

ALTER TABLE users
  ADD CONSTRAINT users_college_id_fkey
  FOREIGN KEY (college_id) REFERENCES colleges (id);

CREATE INDEX users_college_id_idx
  ON users (college_id);

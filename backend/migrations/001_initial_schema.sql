CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  linkedin TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  help_text TEXT NOT NULL DEFAULT '',
  aoe_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  grad_year INTEGER NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_status_type_idx
  ON users (status, type);

CREATE INDEX IF NOT EXISTS users_type_status_username_id_idx
  ON users (type, status, username, id);

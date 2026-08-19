ALTER TABLE users
  ALTER COLUMN grad_year DROP NOT NULL;

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_grad_year_check;

ALTER TABLE users
  ADD CONSTRAINT users_grad_year_check
  CHECK (grad_year IS NULL OR grad_year BETWEEN 1961 AND 2200);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'user', 'community member'));

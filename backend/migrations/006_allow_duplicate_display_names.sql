ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_name_key;

DROP INDEX IF EXISTS users_name_key;


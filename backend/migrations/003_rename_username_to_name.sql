ALTER TABLE users
  RENAME COLUMN username TO name;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'users'::regclass
      AND conname = 'users_username_key'
  ) THEN
    ALTER TABLE users
      RENAME CONSTRAINT users_username_key TO users_name_key;
  END IF;
END $$;

ALTER INDEX IF EXISTS users_username_key
  RENAME TO users_name_key;

ALTER INDEX IF EXISTS users_type_status_username_id_idx
  RENAME TO users_type_status_name_id_idx;

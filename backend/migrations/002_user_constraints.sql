DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_type_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_type_check
      CHECK (type IN ('mentor', 'mentee')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_status_check
      CHECK (status IN ('pending', 'approved', 'denied')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('admin', 'user')) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_grad_year_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_grad_year_check
      CHECK (grad_year BETWEEN 1961 AND 2200) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_aoe_list_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_aoe_list_check
      CHECK (jsonb_typeof(aoe_list) = 'array') NOT VALID;
  END IF;
END $$;

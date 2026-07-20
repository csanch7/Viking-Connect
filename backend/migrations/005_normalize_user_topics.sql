CREATE TABLE topics (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_topics (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, topic_id)
);

INSERT INTO topics (name)
VALUES
  ('Accounting'),
  ('Artificial Intelligence'),
  ('Business Strategy'),
  ('Career Planning'),
  ('College Readiness'),
  ('Communications'),
  ('Cybersecurity'),
  ('Data Analysis'),
  ('Databases'),
  ('Engineering'),
  ('Entrepreneurship'),
  ('Excel'),
  ('Finance'),
  ('Healthcare'),
  ('Human Resources'),
  ('Interview Preparation'),
  ('Leadership'),
  ('Marketing'),
  ('Networking'),
  ('Personal Finance'),
  ('Product Management'),
  ('Programming'),
  ('Project Management'),
  ('Resume Review'),
  ('Sales'),
  ('Technology')
ON CONFLICT (name) DO NOTHING;

INSERT INTO topics (name)
SELECT DISTINCT TRIM(existing_topic.name)
FROM users
CROSS JOIN LATERAL jsonb_array_elements_text(users.aoe_list) AS existing_topic(name)
WHERE TRIM(existing_topic.name) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_topics (user_id, topic_id)
SELECT DISTINCT users.id, topics.id
FROM users
CROSS JOIN LATERAL jsonb_array_elements_text(users.aoe_list) AS existing_topic(name)
JOIN topics ON topics.name = TRIM(existing_topic.name)
ON CONFLICT (user_id, topic_id) DO NOTHING;

ALTER TABLE users
  DROP COLUMN aoe_list;

CREATE INDEX user_topics_topic_user_idx
  ON user_topics (topic_id, user_id);

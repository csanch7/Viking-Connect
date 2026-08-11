WITH duplicate_topics AS (
  SELECT
    id AS duplicate_id,
    MIN(id) OVER (PARTITION BY LOWER(name)) AS canonical_id
  FROM topics
),
reassigned_topics AS (
  INSERT INTO user_topics (user_id, topic_id)
  SELECT user_topics.user_id, duplicate_topics.canonical_id
  FROM user_topics
  JOIN duplicate_topics
    ON duplicate_topics.duplicate_id = user_topics.topic_id
  WHERE duplicate_topics.duplicate_id <> duplicate_topics.canonical_id
  ON CONFLICT (user_id, topic_id) DO NOTHING
)
DELETE FROM topics
USING duplicate_topics
WHERE topics.id = duplicate_topics.duplicate_id
  AND duplicate_topics.duplicate_id <> duplicate_topics.canonical_id;

CREATE UNIQUE INDEX topics_name_lower_unique_idx
  ON topics (LOWER(name));

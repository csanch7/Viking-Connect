CREATE TABLE member_match_actions (
  actor_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  acted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (actor_user_id, subject_user_id),
  CONSTRAINT member_match_actions_action_check
    CHECK (action IN ('contacted', 'dismissed')),
  CONSTRAINT member_match_actions_not_self_check
    CHECK (actor_user_id <> subject_user_id)
);

CREATE INDEX member_match_actions_history_idx
  ON member_match_actions (actor_user_id, action, acted_at DESC);

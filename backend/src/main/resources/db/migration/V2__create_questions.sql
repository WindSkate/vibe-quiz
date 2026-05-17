CREATE TABLE questions (
    id          BIGSERIAL PRIMARY KEY,
    topic_id    BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    text        TEXT NOT NULL,
    image_path  VARCHAR(500),
    option_a    VARCHAR(500) NOT NULL,
    option_b    VARCHAR(500) NOT NULL,
    option_c    VARCHAR(500) NOT NULL,
    option_d    VARCHAR(500) NOT NULL,
    correct     CHAR(1) NOT NULL CHECK (correct IN ('A', 'B', 'C', 'D')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_topic_id ON questions(topic_id);

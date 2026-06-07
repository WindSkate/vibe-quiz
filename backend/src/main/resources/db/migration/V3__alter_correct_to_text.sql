ALTER TABLE questions DROP CONSTRAINT IF EXISTS questions_correct_check;

ALTER TABLE questions ALTER COLUMN correct TYPE VARCHAR(500);

ALTER TABLE questions ADD CONSTRAINT questions_correct_not_empty CHECK (LENGTH(correct) > 0);

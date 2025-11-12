CREATE TABLE difficulties (
    name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE topics (
    name VARCHAR(50) PRIMARY KEY
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(50) REFERENCES difficulties(name),
    topic VARCHAR(50) REFERENCES topics(name),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    collab_id VARCHAR(255) NOT NULL,
    attempt_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(255) NOT NULL,
    submitted_solution TEXT,
    CONSTRAINT uq_user_question UNIQUE(user_id, question_id, collab_id)
);
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

CREATE TABLE question_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    s3_key TEXT NOT NULL
);

-- Enable pgvector extension for AI Embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    avatar_url TEXT,
    tier VARCHAR(100),
    practice_hours DOUBLE PRECISION DEFAULT 0.0,
    total_evaluations INT DEFAULT 0,
    average_score INT DEFAULT 0,
    average_cadence INT DEFAULT 0,
    filler_word_rate DOUBLE PRECISION DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
    id VARCHAR(100) PRIMARY KEY,
    user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
    presentation_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    date VARCHAR(50),
    formatted_date VARCHAR(100),
    duration VARCHAR(50),
    duration_seconds INT,
    file_type VARCHAR(20),
    file_size VARCHAR(50),
    overall_score INT,
    score_tier VARCHAR(100),
    average_cadence INT,
    cadence_status VARCHAR(150),
    filler_word_rate DOUBLE PRECISION,
    filler_word_count INT,
    summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metrics Breakdown Table
CREATE TABLE IF NOT EXISTS evaluation_metrics (
    id BIGSERIAL PRIMARY KEY,
    evaluation_id VARCHAR(100) UNIQUE REFERENCES evaluations(id) ON DELETE CASCADE,
    delivery INT,
    content INT,
    visuals INT,
    pacing INT,
    clarity INT,
    engagement INT
);

-- Transcript Segments Table with Vector Column (pgvector vector(1536))
CREATE TABLE IF NOT EXISTS transcript_segments (
    id VARCHAR(100) PRIMARY KEY,
    evaluation_id VARCHAR(100) REFERENCES evaluations(id) ON DELETE CASCADE,
    start_time VARCHAR(20),
    seconds INT,
    speaker VARCHAR(100),
    text TEXT,
    wpm INT,
    tone VARCHAR(50),
    embedding vector(1536) -- pgvector 1536-dimensional vector for AI similarity search
);

-- Create HNSW index for high performance vector similarity search
CREATE INDEX IF NOT EXISTS idx_transcript_embedding_hnsw 
ON transcript_segments USING hnsw (embedding vector_cosine_ops);

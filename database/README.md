# Database Module - Presentation Evaluator

This folder contains the dedicated database scripts, container setup, and schema definitions for the **Presentation Evaluator** project using **PostgreSQL 16** with the **`pgvector`** extension.

## Contents

- `docker-compose.yml`: Launches PostgreSQL 16 container pre-configured with `pgvector`.
- `schema.sql`: Initializes DDL database tables (`users`, `evaluations`, `evaluation_metrics`, `transcript_segments`) and creates the `pgvector` HNSW vector similarity index.

## Running the Database

### Option 1: Using Docker (Recommended)
```bash
cd /home/kulayappa/Desktop/SE_Project/presentation-evaluator/database
docker compose up -d
```
- **Port**: `5432`
- **Database**: `presentation_db`
- **Username**: `postgres`
- **Password**: `postgrespassword`

### Option 2: Using Native PostgreSQL
```bash
sudo -u postgres psql -c "CREATE DATABASE presentation_db;"
sudo -u postgres psql -d presentation_db -c "CREATE EXTENSION IF NOT EXISTS vector;"
sudo -u postgres psql -d presentation_db -f schema.sql
```

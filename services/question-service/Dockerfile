# ======================
# 1. Base Image
# ======================
FROM python:3.12-slim AS base

# Set working directory
WORKDIR /app

# Prevent Python from writing .pyc files and enable buffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Install system dependencies (needed for some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc curl \
    && rm -rf /var/lib/apt/lists/*

# ======================
# 2. Dependencies Stage
# ======================
FROM base AS deps

# Install Python dependencies separately to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# ======================
# 3. Runtime Stage
# ======================
FROM base AS runtime

# Create a non-root user
RUN useradd -m fastapiuser

# Copy installed deps from deps stage
COPY --from=deps /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Set ownership
## Temporarily commented out for build speed; uncomment for production
# RUN chown -R fastapiuser:fastapiuser /app
# USER fastapiuser

# Expose FastAPI default port
EXPOSE 8000

# Run the application with uvicorn (note: app.main:app instead of main:app)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]

# Dockerfile for ReTech Local Sanitization Agent
FROM python:3.12-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install dependencies first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code only (README, bat files, etc. excluded via .dockerignore)
COPY app/ ./app/
COPY run_agent.py .
COPY create_test_photos.py .
COPY wipe_test_photos.py .
COPY agent_config.json .

EXPOSE 8000

CMD ["python", "run_agent.py", "--serve", "--host", "0.0.0.0", "--port", "8000"]

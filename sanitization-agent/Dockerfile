# Dockerfile for ReTech Local Sanitization Agent
FROM python:3.12-slim

WORKDIR /app

# Prevent Python from writing pyc files and buffering stdout
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "run_agent.py", "--serve", "--host", "0.0.0.0", "--port", "8000"]


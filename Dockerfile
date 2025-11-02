FROM python:3.11-slim

WORKDIR /app

# Installing dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copying dependency files
COPY pyproject.toml poetry.lock ./

# Installing Poetry
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

# Copying source code
COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
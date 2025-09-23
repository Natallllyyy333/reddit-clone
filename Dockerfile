FROM python:3.11-slim

WORKDIR /app

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копирование файлов зависимостей
COPY pyproject.toml poetry.lock ./

# Установка Poetry
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev

# Копирование исходного кода
COPY . .

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
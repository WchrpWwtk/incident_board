FROM python:3.14-slim

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN pip install uv
RUN uv sync --frozen

COPY . .

EXPOSE 8000

CMD ["uv", "run", "gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
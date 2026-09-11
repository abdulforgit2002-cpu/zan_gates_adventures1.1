FROM php:8.5-cli

RUN apt-get update \
    && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

CMD ["sh", "-c", "php -S 0.0.0.0:${PORT} -t public public/index.php"]

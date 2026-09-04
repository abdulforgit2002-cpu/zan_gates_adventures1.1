<?php

class Router
{
    private array $routes = [];

    public function get(
        string $path,
        callable $handler
    ): void {

        $this->routes['GET'][$path] = $handler;
    }

    public function post(
        string $path,
        callable $handler
    ): void {

        $this->routes['POST'][$path] = $handler;
    }

    public function put(
        string $path,
        callable $handler
    ): void {

        $this->routes['PUT'][$path] = $handler;
    }

    public function delete(
        string $path,
        callable $handler
    ): void {

        $this->routes['DELETE'][$path] = $handler;
    }

    public function dispatch(
        string $method,
        string $uri
    ): void {

        $path = parse_url($uri, PHP_URL_PATH);

        foreach ($this->routes[$method] ?? [] as $route => $handler) {

            $pattern = preg_replace(
                '#\{([a-zA-Z_][a-zA-Z0-9_]*)\}#',
                '([^/]+)',
                $route
            );

            $pattern = '#^' . $pattern . '$#';

            if (preg_match($pattern, $path, $matches)) {

                array_shift($matches);

                $handler(...array_map(
                    fn($value) => ctype_digit($value)
                        ? (int) $value
                        : $value,
                    $matches
                ));

                return;
            }
        }

        Response::error(
            'Route not found.',
            404
        );
    }
}
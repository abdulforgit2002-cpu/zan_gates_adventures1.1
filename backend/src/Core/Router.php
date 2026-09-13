<?php

class Router
{
    private array $routes = [];

    public function get(
        string $path,
        callable|array $handler
    ): void {
        $this->routes['GET'][$path] = $handler;
    }

    public function post(
        string $path,
        callable|array $handler
    ): void {
        $this->routes['POST'][$path] = $handler;
    }

    public function put(
        string $path,
        callable|array $handler
    ): void {
        $this->routes['PUT'][$path] = $handler;
    }

    public function delete(
        string $path,
        callable|array $handler
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

                $args = array_map(
                    fn($value) => ctype_digit($value)
                        ? (int) $value
                        : $value,
                    $matches
                );

                /*
                |----------------------------------------------------------
                | Resolve the handler
                |----------------------------------------------------------
                |
                | Supported forms:
                |
                |   - Closure:                 function ($a, $b) { … }
                |   - Array [object, method]:  [$controller, 'index']
                |   - Array [class, method]:   [ClassName::class, 'index']
                |   - String "Class@method":   'ClassName@index'
                |
                | Callable closures and strings are invoked directly.
                | Array handlers are resolved to the correct callable form
                | for the current PHP version.
                |
                */

                if (is_array($handler) && count($handler) === 2) {

                    [$target, $methodName] = $handler;

                    if (is_object($target)) {
                        // Instance method
                        $target->{$methodName}(...$args);
                    } elseif (is_string($target) && class_exists($target)) {
                        // Static method on a class name
                        $target::$methodName(...$args);
                    } else {
                        Response::error(
                            'Route handler could not be resolved.',
                            500
                        );
                    }

                    return;
                }

                if (is_string($handler) && str_contains($handler, '@')) {
                    // "ClassName@method"
                    [$className, $methodName] = explode('@', $handler, 2);

                    if (!class_exists($className)) {
                        Response::error(
                            'Route handler class not found.',
                            500
                        );
                    }

                    $className::$methodName(...$args);

                    return;
                }

                if (is_callable($handler)) {
                    // Closure or other callable
                    $handler(...$args);

                    return;
                }

                Response::error(
                    'Route handler is not callable.',
                    500
                );
            }
        }

        Response::error(
            'Route not found.',
            404
        );
    }
}
package router

import (
	"net/http"
	"regexp"
	"strings"
)

// Param holds a single named URL parameter.
type Param struct {
	Key   string
	Value string
}

// Params is a slice of URL parameters extracted from a dynamic route.
type Params []Param

// Get returns the value of the first parameter with the given key.
func (parameters Params) Get(key string) string {
	for _, param := range parameters {
		if param.Key == key {
			return param.Value
		}
	}
	return ""
}

// HandlerFunc is a Rakta-aware HTTP handler that also receives URL params.
type HandlerFunc func(responseWriter http.ResponseWriter, request *http.Request, params Params)

// route holds a compiled route definition.
type route struct {
	method  string
	pattern *regexp.Regexp
	keys    []string
	handler HandlerFunc
}

// Router is a lightweight, high-performance HTTP router for the Go engine.
// It supports static routes, named dynamic segments (:id), and catch-all segments (*slug).
type Router struct {
	routes     []route
	notFound   http.HandlerFunc
	middleware []func(http.HandlerFunc) http.HandlerFunc
}

// New creates and returns a new Router.
func New() *Router {
	return &Router{
		notFound: func(responseWriter http.ResponseWriter, _ *http.Request) {
			http.Error(responseWriter, "404 not found", http.StatusNotFound)
		},
	}
}

// Use adds global middleware to the router. Middleware is applied in FIFO order.
func (router *Router) Use(middlewareFunc func(http.HandlerFunc) http.HandlerFunc) {
	router.middleware = append(router.middleware, middlewareFunc)
}

// NotFound sets a custom 404 handler.
func (router *Router) NotFound(handler http.HandlerFunc) {
	router.notFound = handler
}

// Handle registers a handler for the given HTTP method and URL pattern.
// Pattern syntax:
//   - /users/:id           -> named param
//   - /files/*path         -> catch-all param
//   - /static/about        -> static segment
func (router *Router) Handle(method, pattern string, handler HandlerFunc) {
	re, keys := compilePattern(pattern)
	router.routes = append(router.routes, route{
		method:  strings.ToUpper(method),
		pattern: re,
		keys:    keys,
		handler: handler,
	})
}

// GET registers a GET handler.
func (router *Router) GET(pattern string, handler HandlerFunc) {
	router.Handle("GET", pattern, handler)
}

// POST registers a POST handler.
func (router *Router) POST(pattern string, handler HandlerFunc) {
	router.Handle("POST", pattern, handler)
}

// PUT registers a PUT handler.
func (router *Router) PUT(pattern string, handler HandlerFunc) {
	router.Handle("PUT", pattern, handler)
}

// PATCH registers a PATCH handler.
func (router *Router) PATCH(pattern string, handler HandlerFunc) {
	router.Handle("PATCH", pattern, handler)
}

// DELETE registers a DELETE handler.
func (router *Router) DELETE(pattern string, handler HandlerFunc) {
	router.Handle("DELETE", pattern, handler)
}

// ServeHTTP implements http.Handler, making Router compatible with net/http.
func (router *Router) ServeHTTP(responseWriter http.ResponseWriter, request *http.Request) {
	for _, routeEntry := range router.routes {
		if routeEntry.method != request.Method {
			continue
		}
		matchResults := routeEntry.pattern.FindStringSubmatch(request.URL.Path)
		if matchResults == nil {
			continue
		}
		var params Params
		for index, key := range routeEntry.keys {
			if index+1 < len(matchResults) {
				params = append(params, Param{Key: key, Value: matchResults[index+1]})
			}
		}
		finalHandler := http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
			routeEntry.handler(responseWriter, request, params)
		})
		for index := len(router.middleware) - 1; index >= 0; index-- {
			finalHandler = router.middleware[index](finalHandler)
		}
		finalHandler.ServeHTTP(responseWriter, request)
		return
	}
	router.notFound(responseWriter, request)
}

// compilePattern converts a URL pattern string into a regexp and a list of
// named capture keys.
func compilePattern(pattern string) (*regexp.Regexp, []string) {
	var keys []string
	segments := strings.Split(pattern, "/")
	var parts []string

	for _, seg := range segments {
		switch {
		case strings.HasPrefix(seg, "*"):
			key := seg[1:]
			if key == "" {
				key = "wildcard"
			}
			keys = append(keys, key)
			parts = append(parts, "(.+)")
		case strings.HasPrefix(seg, ":"):
			keys = append(keys, seg[1:])
			parts = append(parts, "([^/]+)")
		default:
			parts = append(parts, regexp.QuoteMeta(seg))
		}
	}

	re := regexp.MustCompile("^" + strings.Join(parts, "/") + "$")
	return re, keys
}

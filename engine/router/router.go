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
func (p Params) Get(key string) string {
	for _, param := range p {
		if param.Key == key {
			return param.Value
		}
	}
	return ""
}

// HandlerFunc is a Rakta-aware HTTP handler that also receives URL params.
type HandlerFunc func(w http.ResponseWriter, r *http.Request, params Params)

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
		notFound: func(w http.ResponseWriter, _ *http.Request) {
			http.Error(w, "404 not found", http.StatusNotFound)
		},
	}
}

// Use adds global middleware to the router. Middleware is applied in FIFO order.
func (r *Router) Use(mw func(http.HandlerFunc) http.HandlerFunc) {
	r.middleware = append(r.middleware, mw)
}

// NotFound sets a custom 404 handler.
func (r *Router) NotFound(h http.HandlerFunc) {
	r.notFound = h
}

// Handle registers a handler for the given HTTP method and URL pattern.
// Pattern syntax:
//   - /users/:id           -> named param
//   - /files/*path         -> catch-all param
//   - /static/about        -> static segment
func (r *Router) Handle(method, pattern string, handler HandlerFunc) {
	re, keys := compilePattern(pattern)
	r.routes = append(r.routes, route{
		method:  strings.ToUpper(method),
		pattern: re,
		keys:    keys,
		handler: handler,
	})
}

// GET registers a GET handler.
func (r *Router) GET(pattern string, handler HandlerFunc) {
	r.Handle("GET", pattern, handler)
}

// POST registers a POST handler.
func (r *Router) POST(pattern string, handler HandlerFunc) {
	r.Handle("POST", pattern, handler)
}

// PUT registers a PUT handler.
func (r *Router) PUT(pattern string, handler HandlerFunc) {
	r.Handle("PUT", pattern, handler)
}

// PATCH registers a PATCH handler.
func (r *Router) PATCH(pattern string, handler HandlerFunc) {
	r.Handle("PATCH", pattern, handler)
}

// DELETE registers a DELETE handler.
func (r *Router) DELETE(pattern string, handler HandlerFunc) {
	r.Handle("DELETE", pattern, handler)
}

// ServeHTTP implements http.Handler, making Router compatible with net/http.
func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	for _, rt := range r.routes {
		if rt.method != req.Method {
			continue
		}
		matches := rt.pattern.FindStringSubmatch(req.URL.Path)
		if matches == nil {
			continue
		}
		var params Params
		for i, key := range rt.keys {
			if i+1 < len(matches) {
				params = append(params, Param{Key: key, Value: matches[i+1]})
			}
		}
		final := http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
			rt.handler(w, req, params)
		})
		for i := len(r.middleware) - 1; i >= 0; i-- {
			final = r.middleware[i](final)
		}
		final.ServeHTTP(w, req)
		return
	}
	r.notFound(w, req)
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

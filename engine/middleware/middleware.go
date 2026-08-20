package middleware

import (
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

// Result is the outcome of running a middleware handler.
type Result struct {
	// Continue signals that the next handler in the chain should be called.
	Continue bool
	// Redirect holds a URL to redirect to (non-empty → stop chain, 3xx response).
	Redirect string
	// Status is the HTTP status code used with Redirect (default 302).
	Status int
	// Rewrite holds a new path to continue routing with (transparent to client).
	Rewrite string
	// Aborted carries an HTTP status code to send immediately (no body by default).
	Aborted int
}

// Context carries per-request information through the middleware stack.
type Context struct {
	Request  *http.Request
	Response http.ResponseWriter
	// PathOverride allows middleware to change the effective request path.
	PathOverride string
	// Data is a free-form map for passing values between middleware layers.
	Data map[string]any
}

// Handler is the function signature for a single middleware unit.
type Handler func(ctx *Context) Result

// Stack is an ordered list of middleware handlers. Handlers are called in
// registration order; the chain stops as soon as a handler returns a non-Continue result.
type Stack struct {
	handlers []Handler
}

// NewStack returns an empty Stack.
func NewStack() *Stack {
	return &Stack{}
}

// Use appends a handler to the stack.
func (stack *Stack) Use(handler Handler) {
	stack.handlers = append(stack.handlers, handler)
}

// Run executes the middleware stack for the given request/response pair.
// It returns the final Result from whichever handler stopped the chain, or a
// Continue result if all handlers passed through.
func (stack *Stack) Run(responseWriter http.ResponseWriter, request *http.Request) Result {
	requestContext := &Context{
		Request:  request,
		Response: responseWriter,
		Data:     make(map[string]any),
	}

	for _, handler := range stack.handlers {
		result := handler(requestContext)
		// Apply any path override for the next handler.
		if result.Rewrite != "" {
			requestContext.PathOverride = result.Rewrite
			rewrittenRequest := request.Clone(request.Context())
			rewrittenRequest.URL.Path = result.Rewrite
			requestContext.Request = rewrittenRequest
			continue // rewrite does not stop the chain
		}
		if !result.Continue {
			return result
		}
	}

	return Result{Continue: true}
}

// Apply writes the side-effects of a Result to the ResponseWriter.
// Returns true when the response has been committed (caller must not write further).
func Apply(responseWriter http.ResponseWriter, request *http.Request, result Result) bool {
	if !result.Continue {
		switch {
		case result.Redirect != "":
			status := result.Status
			if status == 0 {
				status = http.StatusFound
			}
			if request == nil {
				request = &http.Request{Method: http.MethodGet, URL: &url.URL{Path: "/"}}
			}
			http.Redirect(responseWriter, request, result.Redirect, status)
			return true
		case result.Aborted != 0:
			http.Error(responseWriter, http.StatusText(result.Aborted), result.Aborted)
			return true
		}
	}
	return false
}

// ---- Convenience constructors for common Result values ----

// Next returns a Continue result, passing control to the next middleware.
func Next() Result {
	return Result{Continue: true}
}

// Redirect returns a redirect result with an optional custom status code.
// If status is 0, 302 (Found) is used.
func Redirect(to string, status int) Result {
	if status == 0 {
		status = http.StatusFound
	}
	return Result{Redirect: to, Status: status}
}

// Rewrite returns a rewrite result that changes the effective URL path without
// sending a redirect to the client. The chain continues after the rewrite.
func Rewrite(path string) Result {
	return Result{Continue: true, Rewrite: path}
}

// Abort returns a result that immediately ends the request with the given
// HTTP status code.
func Abort(status int) Result {
	return Result{Aborted: status}
}

// ---- Built-in middleware ----

// Logger returns a middleware that prints each request and its outcome to stdout.
func Logger() Handler {
	return func(ctx *Context) Result {
		method := ctx.Request.Method
		path := ctx.Request.URL.Path
		if ctx.PathOverride != "" {
			path = ctx.PathOverride
		}
		fmt.Printf("[RAKTA] %s %s\n", method, path)
		return Next()
	}
}

// CORS returns middleware that adds Cross-Origin Resource Sharing headers.
// origins should be a comma-separated list of allowed origins, or "*".
func CORS(origins string) Handler {
	return func(ctx *Context) Result {
		ctx.Response.Header().Set("Access-Control-Allow-Origin", origins)
		ctx.Response.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		ctx.Response.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if ctx.Request.Method == http.MethodOptions {
			ctx.Response.WriteHeader(http.StatusNoContent)
			return Abort(http.StatusNoContent)
		}
		return Next()
	}
}

// SecureHeaders returns middleware that adds a standard set of security
// response headers recommended for modern web applications.
func SecureHeaders() Handler {
	return func(ctx *Context) Result {
		headerSet := ctx.Response.Header()
		headerSet.Set("X-Frame-Options", "DENY")
		headerSet.Set("X-Content-Type-Options", "nosniff")
		headerSet.Set("Referrer-Policy", "strict-origin-when-cross-origin")
		headerSet.Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		headerSet.Set("X-Rakta-Engine", "go")
		return Next()
	}
}

// PathPrefix returns middleware that restricts a handler to a URL path prefix.
// Requests that do not match the prefix continue to the next handler unchanged.
func PathPrefix(prefix string, inner Handler) Handler {
	return func(ctx *Context) Result {
		path := ctx.Request.URL.Path
		if ctx.PathOverride != "" {
			path = ctx.PathOverride
		}
		if strings.HasPrefix(path, prefix) {
			return inner(ctx)
		}
		return Next()
	}
}

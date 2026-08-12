package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestStackRunsHandlersInOrder(t *testing.T) {
	stack := NewStack()
	calls := []string{}

	stack.Use(func(ctx *Context) Result {
		calls = append(calls, "first")
		ctx.Data["user"] = "rhein"
		return Next()
	})
	stack.Use(func(ctx *Context) Result {
		calls = append(calls, ctx.Data["user"].(string))
		return Abort(http.StatusUnauthorized)
	})
	stack.Use(func(ctx *Context) Result {
		calls = append(calls, "never")
		return Next()
	})

	result := stack.Run(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/", nil))

	if result.Aborted != http.StatusUnauthorized {
		t.Fatalf("expected abort status 401, got %+v", result)
	}
	if len(calls) != 2 || calls[0] != "first" || calls[1] != "rhein" {
		t.Fatalf("unexpected call order: %#v", calls)
	}
}

func TestRewriteContinuesWithPathOverride(t *testing.T) {
	stack := NewStack()
	var observedPath string

	stack.Use(func(ctx *Context) Result {
		return Rewrite("/dashboard")
	})
	stack.Use(func(ctx *Context) Result {
		observedPath = ctx.Request.URL.Path
		return Next()
	})

	result := stack.Run(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/old", nil))

	if !result.Continue {
		t.Fatalf("expected rewrite chain to continue, got %+v", result)
	}
	if observedPath != "/dashboard" {
		t.Fatalf("expected rewritten path, got %q", observedPath)
	}
}

func TestSecurityAndCorsHeaders(t *testing.T) {
	stack := NewStack()
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodOptions, "/api", nil)

	stack.Use(SecureHeaders())
	stack.Use(CORS("https://raktajs.dev"))

	result := stack.Run(recorder, request)

	if result.Aborted != http.StatusNoContent {
		t.Fatalf("expected options preflight abort, got %+v", result)
	}
	if recorder.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatal("missing secure X-Frame-Options header")
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "https://raktajs.dev" {
		t.Fatal("missing CORS origin header")
	}
}

func TestPathPrefixRunsOnlyForMatchingPath(t *testing.T) {
	stack := NewStack()
	called := false

	stack.Use(PathPrefix("/api", func(ctx *Context) Result {
		called = true
		return Abort(http.StatusForbidden)
	}))

	result := stack.Run(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/docs", nil))
	if !result.Continue || called {
		t.Fatalf("expected non matching path to continue, result=%+v called=%v", result, called)
	}

	result = stack.Run(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/api/users", nil))
	if result.Aborted != http.StatusForbidden || !called {
		t.Fatalf("expected matching path to abort, result=%+v called=%v", result, called)
	}
}

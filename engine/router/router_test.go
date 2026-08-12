package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRouterStaticAndDynamic(t *testing.T) {
	r := New()
	var matchedPath string
	var paramVal string

	r.GET("/", func(w http.ResponseWriter, req *http.Request, p Params) {
		matchedPath = "/"
	})
	r.GET("/user/:id", func(w http.ResponseWriter, req *http.Request, p Params) {
		matchedPath = "/user/:id"
		paramVal = p.Get("id")
	})

	rec := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/", nil)
	r.ServeHTTP(rec, req)

	if matchedPath != "/" {
		t.Errorf("expected root match, got %s", matchedPath)
	}

	rec = httptest.NewRecorder()
	req = httptest.NewRequest("GET", "/user/123", nil)
	r.ServeHTTP(rec, req)

	if matchedPath != "/user/:id" || paramVal != "123" {
		t.Errorf("expected /user/:id match with id=123, got path=%s param=%s", matchedPath, paramVal)
	}
}

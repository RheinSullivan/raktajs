package router

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRouterStaticAndDynamic(test *testing.T) {
	router := New()
	var matchedPath string
	var paramVal string

	router.GET("/", func(writer http.ResponseWriter, request *http.Request, params Params) {
		matchedPath = "/"
	})
	router.GET("/user/:id", func(writer http.ResponseWriter, request *http.Request, params Params) {
		matchedPath = "/user/:id"
		paramVal = params.Get("id")
	})

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest("GET", "/", nil)
	router.ServeHTTP(recorder, request)

	if matchedPath != "/" {
		test.Errorf("expected root match, got %s", matchedPath)
	}

	recorder = httptest.NewRecorder()
	request = httptest.NewRequest("GET", "/user/123", nil)
	router.ServeHTTP(recorder, request)

	if matchedPath != "/user/:id" || paramVal != "123" {
		test.Errorf("expected /user/:id match with id=123, got path=%s param=%s", matchedPath, paramVal)
	}
}

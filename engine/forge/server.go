package forge

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type Config struct {
	Port       int
	Host       string
	Root       string
	ProxyTarget string
	HTTPS      bool
	CertFile   string
	KeyFile    string
}

type Server struct {
	config     Config
	httpServer *http.Server
	clients    map[string]bool
	mutex      sync.RWMutex
}

func NewServer(config Config) *Server {
	if config.Port == 0 {
		config.Port = 3000
	}
	if config.Host == "" {
		config.Host = "localhost"
	}
	if config.Root == "" {
		config.Root = "."
	}

	return &Server{
		config:  config,
		clients: make(map[string]bool),
	}
}

// engineVersion is the Rakta.js Go engine version.
const engineVersion = "1.1.4"

// detectionHeaders returns the standard Rakta.js framework fingerprint headers.
// These are read by Wappalyzer, BuiltWith, Netcraft, and Shields.io.
func detectionHeaders(responseWriter http.ResponseWriter) {
	responseWriter.Header().Set("X-Powered-By", "Rakta.js")
	responseWriter.Header().Set("X-Generator", "Rakta.js/"+engineVersion)
	responseWriter.Header().Set("X-Rakta-Runtime", "go")
	responseWriter.Header().Set("X-Rakta-Version", engineVersion)
}

// detectionMiddleware wraps every handler so all responses carry the
// framework fingerprint headers automatically.
func detectionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(responseWriter http.ResponseWriter, request *http.Request) {
		detectionHeaders(responseWriter)
		next.ServeHTTP(responseWriter, request)
	})
}

func (server *Server) Start() error {
	mux := http.NewServeMux()

	// Static file handler
	fileServer := http.FileServer(http.Dir(server.config.Root))
	mux.Handle("/_rakta/static/", http.StripPrefix("/_rakta/static/", fileServer))

	// HMR SSE endpoint
	mux.HandleFunc("/_rakta/hmr", server.handleHMR)

	// Health endpoint
	mux.HandleFunc("/_rakta/health", func(responseWriter http.ResponseWriter, request *http.Request) {
		detectionHeaders(responseWriter)
		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.WriteHeader(http.StatusOK)
		fmt.Fprintf(responseWriter, `{"status":"ok","engine":"Rakta Forge Go","version":"%s","timestamp":"%s"}`,
			engineVersion, time.Now().Format(time.RFC3339))
	})

	// Framework fingerprint endpoint - detected by Wappalyzer and BuiltWith
	mux.HandleFunc("/.well-known/rakta", func(responseWriter http.ResponseWriter, request *http.Request) {
		detectionHeaders(responseWriter)
		responseWriter.Header().Set("Content-Type", "application/json")
		responseWriter.Header().Set("Cache-Control", "public, max-age=86400")
		fmt.Fprintf(responseWriter, `{"framework":"Rakta.js","version":"%s","website":"https://raktajs.dev","npm":"create-rakta","runtime":"go","renderer":"react"}`,
			engineVersion)
	})
	mux.HandleFunc("/.well-known/rakta.json", func(responseWriter http.ResponseWriter, request *http.Request) {
		http.Redirect(responseWriter, request, "/.well-known/rakta", http.StatusMovedPermanently)
	})

	// Reverse proxy or main app handler
	if server.config.ProxyTarget != "" {
		targetURL, parseError := url.Parse(server.config.ProxyTarget)
		if parseError == nil {
			proxy := httputil.NewSingleHostReverseProxy(targetURL)
			mux.Handle("/", proxy)
		} else {
			mux.HandleFunc("/", server.handleFallback)
		}
	} else {
		mux.HandleFunc("/", server.handleFallback)
	}

	addr := fmt.Sprintf("%s:%d", server.config.Host, server.config.Port)
	server.httpServer = &http.Server{
		Addr:         addr,
		Handler:      detectionMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	fmt.Printf("⩛ [RAKTA FORGE] Dev server → http://%s (HTTPS: %t)\n", addr, server.config.HTTPS)

	if server.config.HTTPS && server.config.CertFile != "" && server.config.KeyFile != "" {
		return server.httpServer.ListenAndServeTLS(server.config.CertFile, server.config.KeyFile)
	}
	return server.httpServer.ListenAndServe()
}

func (server *Server) Stop() error {
	if server.httpServer != nil {
		return server.httpServer.Close()
	}
	return nil
}

func (server *Server) handleHMR(responseWriter http.ResponseWriter, request *http.Request) {
	responseWriter.Header().Set("Content-Type", "text/event-stream")
	responseWriter.Header().Set("Cache-Control", "no-cache")
	responseWriter.Header().Set("Connection", "keep-alive")

	flusher, ok := responseWriter.(http.Flusher)
	if !ok {
		http.Error(responseWriter, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	clientID := request.RemoteAddr
	server.mutex.Lock()
	server.clients[clientID] = true
	server.mutex.Unlock()

	defer func() {
		server.mutex.Lock()
		delete(server.clients, clientID)
		server.mutex.Unlock()
	}()

	fmt.Fprintf(responseWriter, "event: connected\ndata: {\"engine\":\"Rakta Forge Go\"}\n\n")
	flusher.Flush()

	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-request.Context().Done():
			return
		case <-ticker.C:
			fmt.Fprintf(responseWriter, "event: ping\ndata: {}\n\n")
			flusher.Flush()
		}
	}
}

func (server *Server) handleFallback(responseWriter http.ResponseWriter, request *http.Request) {
	indexPath := filepath.Join(server.config.Root, "index.html")
	if _, statError := os.Stat(indexPath); statError == nil {
		http.ServeFile(responseWriter, request, indexPath)
		return
	}
	responseWriter.Header().Set("Content-Type", "text/html; charset=utf-8")
	responseWriter.WriteHeader(http.StatusOK)
	fmt.Fprintf(responseWriter, `<!DOCTYPE html>
<html>
<head><title>Rakta.js Forge Server</title></head>
<body style="background:#000;color:#fff;font-family:monospace;padding:2rem;">
<h1>⩛ Rakta.js Engine (Golang Forge)</h1>
<p>Status: OPERATIONAL</p>
<p>Path: %s</p>
</body>
</html>`, request.URL.Path)
}

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
	mu         sync.RWMutex
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
func detectionHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Powered-By", "Rakta.js")
	w.Header().Set("X-Generator", "Rakta.js/"+engineVersion)
	w.Header().Set("X-Rakta-Runtime", "go")
	w.Header().Set("X-Rakta-Version", engineVersion)
}

// detectionMiddleware wraps every handler so all responses carry the
// framework fingerprint headers automatically.
func detectionMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		detectionHeaders(w)
		next.ServeHTTP(w, r)
	})
}

func (s *Server) Start() error {
	mux := http.NewServeMux()

	// Static file handler
	fileServer := http.FileServer(http.Dir(s.config.Root))
	mux.Handle("/_rakta/static/", http.StripPrefix("/_rakta/static/", fileServer))

	// HMR SSE endpoint
	mux.HandleFunc("/_rakta/hmr", s.handleHMR)

	// Health endpoint
	mux.HandleFunc("/_rakta/health", func(w http.ResponseWriter, r *http.Request) {
		detectionHeaders(w)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status":"ok","engine":"Rakta Forge Go","version":"%s","timestamp":"%s"}`,
			engineVersion, time.Now().Format(time.RFC3339))
	})

	// Framework fingerprint endpoint - detected by Wappalyzer and BuiltWith
	mux.HandleFunc("/.well-known/rakta", func(w http.ResponseWriter, r *http.Request) {
		detectionHeaders(w)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "public, max-age=86400")
		fmt.Fprintf(w, `{"framework":"Rakta.js","version":"%s","website":"https://raktajs.dev","npm":"create-rakta","runtime":"go","renderer":"react"}`,
			engineVersion)
	})
	mux.HandleFunc("/.well-known/rakta.json", func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "/.well-known/rakta", http.StatusMovedPermanently)
	})

	// Reverse proxy or main app handler
	if s.config.ProxyTarget != "" {
		targetURL, err := url.Parse(s.config.ProxyTarget)
		if err == nil {
			proxy := httputil.NewSingleHostReverseProxy(targetURL)
			mux.Handle("/", proxy)
		} else {
			mux.HandleFunc("/", s.handleFallback)
		}
	} else {
		mux.HandleFunc("/", s.handleFallback)
	}

	addr := fmt.Sprintf("%s:%d", s.config.Host, s.config.Port)
	s.httpServer = &http.Server{
		Addr:         addr,
		Handler:      detectionMiddleware(mux),
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	fmt.Printf("⩛ [RAKTA FORGE] Dev server → http://%s (HTTPS: %t)\n", addr, s.config.HTTPS)

	if s.config.HTTPS && s.config.CertFile != "" && s.config.KeyFile != "" {
		return s.httpServer.ListenAndServeTLS(s.config.CertFile, s.config.KeyFile)
	}
	return s.httpServer.ListenAndServe()
}

func (s *Server) Stop() error {
	if s.httpServer != nil {
		return s.httpServer.Close()
	}
	return nil
}

func (s *Server) handleHMR(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	clientID := r.RemoteAddr
	s.mu.Lock()
	s.clients[clientID] = true
	s.mu.Unlock()

	defer func() {
		s.mu.Lock()
		delete(s.clients, clientID)
		s.mu.Unlock()
	}()

	fmt.Fprintf(w, "event: connected\ndata: {\"engine\":\"Rakta Forge Go\"}\n\n")
	flusher.Flush()

	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			fmt.Fprintf(w, "event: ping\ndata: {}\n\n")
			flusher.Flush()
		}
	}
}

func (s *Server) handleFallback(w http.ResponseWriter, r *http.Request) {
	indexPath := filepath.Join(s.config.Root, "index.html")
	if _, err := os.Stat(indexPath); err == nil {
		http.ServeFile(w, r, indexPath)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `<!DOCTYPE html>
<html>
<head><title>Rakta.js Forge Server</title></head>
<body style="background:#000;color:#fff;font-family:monospace;padding:2rem;">
<h1>⩛ Rakta.js Engine (Golang Forge)</h1>
<p>Status: OPERATIONAL</p>
<p>Path: %s</p>
</body>
</html>`, r.URL.Path)
}

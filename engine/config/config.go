package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// RenderMode describes how a project renders pages.
type RenderMode string

const (
	RenderModeCSR     RenderMode = "csr"
	RenderModeSSR     RenderMode = "ssr"
	RenderModeSSG     RenderMode = "ssg"
	RenderModeSPA     RenderMode = "spa"
	RenderModeISR     RenderMode = "isr"
	RenderModeHybrid  RenderMode = "hybrid"
	RenderModeEdge    RenderMode = "edge"
)

// ServerConfig holds the dev server / production server settings.
type ServerConfig struct {
	Port int    `json:"port"`
	Host string `json:"host"`
}

// BuildConfig holds bundler output settings.
type BuildConfig struct {
	OutDir  string `json:"outDir"`
	Minify  bool   `json:"minify"`
	Analyze bool   `json:"analyze"`
}

// SeoConfig holds default SEO metadata.
type SeoConfig struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	OgImage     string `json:"ogImage,omitempty"`
}

// PwaConfig enables Progressive Web App manifest generation.
type PwaConfig struct {
	Enabled     bool   `json:"enabled"`
	Name        string `json:"name"`
	ShortName   string `json:"shortName"`
	ThemeColor  string `json:"themeColor"`
	BackgroundColor string `json:"backgroundColor"`
}

// Config is the root Rakta.js project configuration parsed from
// rakta.config.json (or the JSON part of rakta.config.ts).
type Config struct {
	AppDir     string       `json:"appDir"`
	PublicDir  string       `json:"publicDir"`
	RenderMode RenderMode   `json:"renderMode"`
	Server     ServerConfig `json:"server"`
	Build      BuildConfig  `json:"build"`
	Seo        SeoConfig    `json:"seo"`
	Pwa        PwaConfig    `json:"pwa"`
}

// Default returns a Config populated with sensible production defaults.
func Default() Config {
	return Config{
		AppDir:     "app",
		PublicDir:  "public",
		RenderMode: RenderModeCSR,
		Server: ServerConfig{
			Port: 3000,
			Host: "localhost",
		},
		Build: BuildConfig{
			OutDir: "dist",
			Minify: true,
		},
		Seo: SeoConfig{
			Title:       "Rakta.js App",
			Description: "Built with Rakta.js - Small in size. Fierce in speed.",
		},
		Pwa: PwaConfig{
			Enabled:         false,
			ThemeColor:      "#0a0a0a",
			BackgroundColor: "#0a0a0a",
		},
	}
}

// Load reads a rakta.config.json file at projectRoot and merges it over the
// default configuration. Missing keys keep their default values.
func Load(projectRoot string) (Config, error) {
	cfg := Default()

	candidates := []string{
		filepath.Join(projectRoot, "rakta.config.json"),
		filepath.Join(projectRoot, ".rakta", "config.json"),
	}

	var jsonPath string
	for _, c := range candidates {
		if _, err := os.Stat(c); err == nil {
			jsonPath = c
			break
		}
	}

	if jsonPath == "" {
		// No config file is not an error; defaults are used.
		return cfg, nil
	}

	data, err := os.ReadFile(jsonPath)
	if err != nil {
		return cfg, fmt.Errorf("rakta config: read %s: %w", jsonPath, err)
	}

	if err := json.Unmarshal(data, &cfg); err != nil {
		return cfg, fmt.Errorf("rakta config: parse %s: %w", jsonPath, err)
	}

	if err := validate(cfg); err != nil {
		return cfg, fmt.Errorf("rakta config: validation: %w", err)
	}

	return cfg, nil
}

// validate checks a Config for obvious mistakes.
func validate(cfg Config) error {
	validModes := map[RenderMode]bool{
		RenderModeCSR: true, RenderModeSSR: true, RenderModeSSG: true,
		RenderModeSPA: true, RenderModeISR: true, RenderModeHybrid: true,
		RenderModeEdge: true,
	}
	if !validModes[cfg.RenderMode] {
		return fmt.Errorf("invalid renderMode %q; must be one of: %s",
			cfg.RenderMode,
			strings.Join([]string{"csr", "ssr", "ssg", "spa", "isr", "hybrid", "edge"}, ", "),
		)
	}
	if cfg.Server.Port < 1 || cfg.Server.Port > 65535 {
		return errors.New("server.port must be in range 1–65535")
	}
	if cfg.AppDir == "" {
		return errors.New("appDir must not be empty")
	}
	return nil
}

// Env reads an environment variable with a typed fallback.
// Keys that begin with "RAKTA_" are reserved for framework use.
func Env(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok {
		return v
	}
	return fallback
}

// EnvBool reads a boolean environment variable ("1", "true", "yes" → true).
func EnvBool(key string, fallback bool) bool {
	v, ok := os.LookupEnv(key)
	if !ok {
		return fallback
	}
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on":
		return true
	case "0", "false", "no", "off":
		return false
	}
	return fallback
}

// IsProduction returns true when RAKTA_ENV or NODE_ENV is "production".
func IsProduction() bool {
	for _, key := range []string{"RAKTA_ENV", "NODE_ENV"} {
		if v := os.Getenv(key); strings.EqualFold(v, "production") {
			return true
		}
	}
	return false
}

// IsDevelopment returns true when RAKTA_ENV or NODE_ENV is "development"
// (or when neither variable is set, which is the implicit dev default).
func IsDevelopment() bool {
	for _, key := range []string{"RAKTA_ENV", "NODE_ENV"} {
		if v := os.Getenv(key); v != "" {
			return strings.EqualFold(v, "development")
		}
	}
	return true // default to development when no env var is present
}

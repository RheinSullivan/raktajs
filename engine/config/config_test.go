package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultConfigIsProductionReady(t *testing.T) {
	cfg := Default()

	if cfg.AppDir != "app" {
		t.Fatalf("expected app dir to default to app, got %q", cfg.AppDir)
	}
	if cfg.PublicDir != "public" {
		t.Fatalf("expected public dir to default to public, got %q", cfg.PublicDir)
	}
	if cfg.RenderMode != RenderModeCSR {
		t.Fatalf("expected csr render mode, got %q", cfg.RenderMode)
	}
	if cfg.Server.Port != 3000 {
		t.Fatalf("expected port 3000, got %d", cfg.Server.Port)
	}
}

func TestLoadMergesJsonConfig(t *testing.T) {
	root := t.TempDir()
	configPath := filepath.Join(root, "rakta.config.json")
	configJson := `{
		"appDir": "src/app",
		"publicDir": "static",
		"renderMode": "spa",
		"server": { "port": 4173, "host": "127.0.0.1" },
		"build": { "outDir": "build", "minify": false, "analyze": true },
		"seo": { "title": "Native Test", "description": "Loaded by Go" },
		"pwa": { "enabled": true, "name": "Rakta", "shortName": "Rakta" }
	}`

	if err := os.WriteFile(configPath, []byte(configJson), 0644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	cfg, err := Load(root)
	if err != nil {
		t.Fatalf("load config: %v", err)
	}

	if cfg.AppDir != "src/app" || cfg.PublicDir != "static" {
		t.Fatalf("unexpected directories: app=%q public=%q", cfg.AppDir, cfg.PublicDir)
	}
	if cfg.RenderMode != RenderModeSPA {
		t.Fatalf("expected spa render mode, got %q", cfg.RenderMode)
	}
	if cfg.Server.Port != 4173 || cfg.Server.Host != "127.0.0.1" {
		t.Fatalf("unexpected server config: %+v", cfg.Server)
	}
	if !cfg.Build.Analyze || cfg.Build.Minify {
		t.Fatalf("unexpected build config: %+v", cfg.Build)
	}
}

func TestLoadRejectsInvalidConfig(t *testing.T) {
	root := t.TempDir()
	configPath := filepath.Join(root, "rakta.config.json")

	if err := os.WriteFile(configPath, []byte(`{"renderMode":"invalid","server":{"port":70000}}`), 0644); err != nil {
		t.Fatalf("write config: %v", err)
	}

	if _, err := Load(root); err == nil {
		t.Fatal("expected invalid config to fail")
	}
}

func TestEnvironmentHelpers(t *testing.T) {
	t.Setenv("RAKTA_BOOL_TRUE", "yes")
	t.Setenv("RAKTA_BOOL_FALSE", "off")
	t.Setenv("RAKTA_ENV", "production")

	if Env("RAKTA_MISSING", "fallback") != "fallback" {
		t.Fatal("expected Env to return fallback")
	}
	if !EnvBool("RAKTA_BOOL_TRUE", false) {
		t.Fatal("expected truthy environment value")
	}
	if EnvBool("RAKTA_BOOL_FALSE", true) {
		t.Fatal("expected falsy environment value")
	}
	if !IsProduction() {
		t.Fatal("expected production environment")
	}
}

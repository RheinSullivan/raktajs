package config

import (
	"os"
	"path/filepath"
	"testing"
)

func TestDefaultConfigIsProductionReady(test *testing.T) {
	configuration := Default()

	if configuration.AppDir != "app" {
		test.Fatalf("expected app dir to default to app, got %q", configuration.AppDir)
	}
	if configuration.PublicDir != "public" {
		test.Fatalf("expected public dir to default to public, got %q", configuration.PublicDir)
	}
	if configuration.RenderMode != RenderModeCSR {
		test.Fatalf("expected csr render mode, got %q", configuration.RenderMode)
	}
	if configuration.Server.Port != 3000 {
		test.Fatalf("expected port 3000, got %d", configuration.Server.Port)
	}
}

func TestLoadMergesJsonConfig(test *testing.T) {
	root := test.TempDir()
	configPath := filepath.Join(root, "rakta.config.json")
	configJsonText := `{
		"appDir": "src/app",
		"publicDir": "static",
		"renderMode": "spa",
		"server": { "port": 4173, "host": "127.0.0.1" },
		"build": { "outDir": "build", "minify": false, "analyze": true },
		"seo": { "title": "Native Test", "description": "Loaded by Go" },
		"pwa": { "enabled": true, "name": "Rakta", "shortName": "Rakta" }
	}`

	if writeError := os.WriteFile(configPath, []byte(configJsonText), 0644); writeError != nil {
		test.Fatalf("write config: %v", writeError)
	}

	configuration, loadError := Load(root)
	if loadError != nil {
		test.Fatalf("load config: %v", loadError)
	}

	if configuration.AppDir != "src/app" || configuration.PublicDir != "static" {
		test.Fatalf("unexpected directories: app=%q public=%q", configuration.AppDir, configuration.PublicDir)
	}
	if configuration.RenderMode != RenderModeSPA {
		test.Fatalf("expected spa render mode, got %q", configuration.RenderMode)
	}
	if configuration.Server.Port != 4173 || configuration.Server.Host != "127.0.0.1" {
		test.Fatalf("unexpected server config: %+v", configuration.Server)
	}
	if !configuration.Build.Analyze || configuration.Build.Minify {
		test.Fatalf("unexpected build config: %+v", configuration.Build)
	}
}

func TestLoadRejectsInvalidConfig(test *testing.T) {
	root := test.TempDir()
	configPath := filepath.Join(root, "rakta.config.json")

	if writeError := os.WriteFile(configPath, []byte(`{"renderMode":"invalid","server":{"port":70000}}`), 0644); writeError != nil {
		test.Fatalf("write config: %v", writeError)
	}

	if _, loadError := Load(root); loadError == nil {
		test.Fatal("expected invalid config to fail")
	}
}

func TestEnvironmentHelpers(test *testing.T) {
	test.Setenv("RAKTA_BOOL_TRUE", "yes")
	test.Setenv("RAKTA_BOOL_FALSE", "off")
	test.Setenv("RAKTA_ENV", "production")

	if Env("RAKTA_MISSING", "fallback") != "fallback" {
		test.Fatal("expected Env to return fallback")
	}
	if !EnvBool("RAKTA_BOOL_TRUE", false) {
		test.Fatal("expected truthy environment value")
	}
	if EnvBool("RAKTA_BOOL_FALSE", true) {
		test.Fatal("expected falsy environment value")
	}
	if !IsProduction() {
		test.Fatal("expected production environment")
	}
}

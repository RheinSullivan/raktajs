package repo

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestFindPackageManifests(t *testing.T) {
	root := t.TempDir()
	writeFile(t, root, "package.json", `{"name":"root","version":"1.1.5"}`)
	writeFile(t, root, "packages/rakta/package.json", `{"name":"raktajs","version":"1.1.5"}`)
	writeFile(t, root, "node_modules/ignored/package.json", `{"name":"ignored","version":"0.0.0"}`)

	manifests, err := FindPackageManifests(root)
	if err != nil {
		t.Fatalf("FindPackageManifests returned error: %v", err)
	}

	if len(manifests) != 2 {
		t.Fatalf("expected 2 manifests, got %d", len(manifests))
	}
	if manifests[0].Name != "root" || manifests[1].Name != "raktajs" {
		t.Fatalf("unexpected manifest order: %#v", manifests)
	}
}

func TestCountLanguages(t *testing.T) {
	root := t.TempDir()
	writeFile(t, root, "src/app.ts", "const app = true\n")
	writeFile(t, root, "tools/ruby/check.rb", "puts 'ok'\n")
	writeFile(t, root, "engine/router/router.go", "package router\n")
	writeFile(t, root, ".tmp/ignored.go", "package ignored\n")

	languages, err := CountLanguages(root)
	if err != nil {
		t.Fatalf("CountLanguages returned error: %v", err)
	}

	seen := map[string]bool{}
	for _, language := range languages {
		seen[language.Language] = true
		if language.Percent <= 0 {
			t.Fatalf("expected positive percent for %#v", language)
		}
	}

	for _, language := range []string{"Go", "Ruby", "TypeScript"} {
		if !seen[language] {
			t.Fatalf("expected language %s in report: %#v", language, languages)
		}
	}
}

func TestBuildAuditReportSerializesToJSON(t *testing.T) {
	root := t.TempDir()
	writeFile(t, root, "package.json", `{"name":"root","version":"1.1.5"}`)
	writeFile(t, root, "tools/check.go", "package tools\n")

	report, err := BuildAuditReport(root)
	if err != nil {
		t.Fatalf("BuildAuditReport returned error: %v", err)
	}

	payload, err := json.Marshal(report)
	if err != nil {
		t.Fatalf("audit report should serialize: %v", err)
	}
	if len(payload) == 0 {
		t.Fatal("expected non-empty JSON payload")
	}
}

func writeFile(t *testing.T, root string, relativePath string, content string) {
	t.Helper()

	path := filepath.Join(root, filepath.FromSlash(relativePath))
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("failed to create directory: %v", err)
	}
	if err := os.WriteFile(path, []byte(content), 0o644); err != nil {
		t.Fatalf("failed to write file: %v", err)
	}
}

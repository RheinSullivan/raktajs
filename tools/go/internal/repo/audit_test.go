package repo

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestFindPackageManifests(test *testing.T) {
	root := test.TempDir()
	writeFile(test, root, "package.json", `{"name":"root","version":"1.1.7"}`)
	writeFile(test, root, "packages/rakta/package.json", `{"name":"raktajs","version":"1.1.7"}`)
	writeFile(test, root, "node_modules/ignored/package.json", `{"name":"ignored","version":"0.0.0"}`)

	manifests, err := FindPackageManifests(root)
	if err != nil {
		test.Fatalf("FindPackageManifests returned error: %v", err)
	}

	if len(manifests) != 2 {
		test.Fatalf("expected 2 manifests, got %d", len(manifests))
	}
	if manifests[0].Name != "root" || manifests[1].Name != "raktajs" {
		test.Fatalf("unexpected manifest order: %#v", manifests)
	}
}

func TestCountLanguages(test *testing.T) {
	root := test.TempDir()
	writeFile(test, root, "src/app.ts", "const app = true\n")
	writeFile(test, root, "tools/ruby/check.rb", "puts 'ok'\n")
	writeFile(test, root, "engine/router/router.go", "package router\n")
	writeFile(test, root, ".tmp/ignored.go", "package ignored\n")

	languages, err := CountLanguages(root)
	if err != nil {
		test.Fatalf("CountLanguages returned error: %v", err)
	}

	seen := map[string]bool{}
	for _, language := range languages {
		seen[language.Language] = true
		if language.Percent <= 0 {
			test.Fatalf("expected positive percent for %#v", language)
		}
	}

	for _, language := range []string{"Go", "Ruby", "TypeScript"} {
		if !seen[language] {
			test.Fatalf("expected language %s in report: %#v", language, languages)
		}
	}
}

func TestBuildAuditReportSerializesToJSON(test *testing.T) {
	root := test.TempDir()
	writeFile(test, root, "package.json", `{"name":"root","version":"1.1.7"}`)
	writeFile(test, root, "tools/check.go", "package tools\n")

	report, err := BuildAuditReport(root)
	if err != nil {
		test.Fatalf("BuildAuditReport returned error: %v", err)
	}

	payload, err := json.Marshal(report)
	if err != nil {
		test.Fatalf("audit report should serialize: %v", err)
	}
	if len(payload) == 0 {
		test.Fatal("expected non-empty JSON payload")
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

package builder

import (
	"os"
	"path/filepath"
	"testing"
)

func writeTestFile(t *testing.T, path string, content string) {
	t.Helper()

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		t.Fatalf("mkdir: %v", err)
	}
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatalf("write file: %v", err)
	}
}

func TestAssetGraphBuildScansSupportedFiles(t *testing.T) {
	root := t.TempDir()
	outDir := filepath.Join(root, "dist-output")

	writeTestFile(t, filepath.Join(root, "app", "page.tsx"), "export default function Page() {}")
	writeTestFile(t, filepath.Join(root, "app", "style.css"), "body { color: white; }")
	writeTestFile(t, filepath.Join(root, "app", "data.json"), `{"ok":true}`)
	writeTestFile(t, filepath.Join(root, "app", "notes.md"), "# ignored")
	writeTestFile(t, filepath.Join(root, "node_modules", "pkg", "index.js"), "ignored()")

	graph := NewBuilder()
	result, err := graph.Build(BuildOptions{
		Analyze:   false,
		OutputDir: outDir,
		SourceDir: root,
	})
	if err != nil {
		t.Fatalf("build failed: %v", err)
	}

	if result.FilesBuilt != 3 {
		t.Fatalf("expected 3 supported files, got %d", result.FilesBuilt)
	}
	if result.TotalBytes == 0 {
		t.Fatal("expected total bytes to be tracked")
	}
	if len(graph.Nodes) != 3 {
		t.Fatalf("expected 3 graph nodes, got %d", len(graph.Nodes))
	}
}

func TestAssetGraphTracksCacheHits(t *testing.T) {
	root := t.TempDir()
	writeTestFile(t, filepath.Join(root, "app.ts"), "export const ok = true;")

	graph := NewBuilder()
	first, err := graph.Build(BuildOptions{SourceDir: root, OutputDir: filepath.Join(root, "dist")})
	if err != nil {
		t.Fatalf("first build failed: %v", err)
	}
	second, err := graph.Build(BuildOptions{SourceDir: root, OutputDir: filepath.Join(root, "dist")})
	if err != nil {
		t.Fatalf("second build failed: %v", err)
	}

	if first.CacheHits != 0 {
		t.Fatalf("first build should not have cache hits, got %d", first.CacheHits)
	}
	if second.CacheHits != 1 {
		t.Fatalf("second build should have one cache hit, got %d", second.CacheHits)
	}
}

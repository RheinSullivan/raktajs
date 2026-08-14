package builder

import (
	"os"
	"path/filepath"
	"testing"
)

func writeTestFile(test *testing.T, path string, content string) {
	test.Helper()

	if createDirectoryError := os.MkdirAll(filepath.Dir(path), 0755); createDirectoryError != nil {
		test.Fatalf("mkdir: %v", createDirectoryError)
	}
	if writeFileError := os.WriteFile(path, []byte(content), 0644); writeFileError != nil {
		test.Fatalf("write file: %v", writeFileError)
	}
}

func TestAssetGraphBuildScansSupportedFiles(test *testing.T) {
	root := test.TempDir()
	outDir := filepath.Join(root, "dist-output")

	writeTestFile(test, filepath.Join(root, "app", "page.tsx"), "export default function Page() {}")
	writeTestFile(test, filepath.Join(root, "app", "style.css"), "body { color: white; }")
	writeTestFile(test, filepath.Join(root, "app", "data.json"), `{"ok":true}`)
	writeTestFile(test, filepath.Join(root, "app", "notes.md"), "# ignored")
	writeTestFile(test, filepath.Join(root, "node_modules", "pkg", "index.js"), "ignored()")

	graph := NewBuilder()
	result, buildError := graph.Build(BuildOptions{
		Analyze:   false,
		OutputDir: outDir,
		SourceDir: root,
	})
	if buildError != nil {
		test.Fatalf("build failed: %v", buildError)
	}

	if result.FilesBuilt != 3 {
		test.Fatalf("expected 3 supported files, got %d", result.FilesBuilt)
	}
	if result.TotalBytes == 0 {
		test.Fatal("expected total bytes to be tracked")
	}
	if len(graph.Nodes) != 3 {
		test.Fatalf("expected 3 graph nodes, got %d", len(graph.Nodes))
	}
}

func TestAssetGraphTracksCacheHits(test *testing.T) {
	root := test.TempDir()
	writeTestFile(test, filepath.Join(root, "app.ts"), "export const ok = true;")

	graph := NewBuilder()
	first, buildError := graph.Build(BuildOptions{SourceDir: root, OutputDir: filepath.Join(root, "dist")})
	if buildError != nil {
		test.Fatalf("first build failed: %v", buildError)
	}
	second, buildError := graph.Build(BuildOptions{SourceDir: root, OutputDir: filepath.Join(root, "dist")})
	if buildError != nil {
		test.Fatalf("second build failed: %v", buildError)
	}

	if first.CacheHits != 0 {
		test.Fatalf("first build should not have cache hits, got %d", first.CacheHits)
	}
	if second.CacheHits != 1 {
		test.Fatalf("second build should have one cache hit, got %d", second.CacheHits)
	}
}

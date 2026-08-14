package watcher

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWatcherScanRespectsExtensionFilter(test *testing.T) {
	root := test.TempDir()
	typeScriptPath := filepath.Join(root, "app", "page.tsx")
	markdownPath := filepath.Join(root, "README.md")

	if mkdirError := os.MkdirAll(filepath.Dir(typeScriptPath), 0755); mkdirError != nil {
		test.Fatalf("mkdir: %v", mkdirError)
	}
	if writeError := os.WriteFile(typeScriptPath, []byte("export default function Page() {}"), 0644); writeError != nil {
		test.Fatalf("write tsx: %v", writeError)
	}
	if writeError := os.WriteFile(markdownPath, []byte("# ignored"), 0644); writeError != nil {
		test.Fatalf("write md: %v", writeError)
	}

	watcher := New(func([]FileChange) {}, Options{
		Extensions: []string{".ts", ".tsx"},
		Roots:      []string{root},
	})
	snapshot := watcher.scan()

	if _, ok := snapshot[typeScriptPath]; !ok {
		test.Fatalf("expected tsx file in snapshot: %#v", snapshot)
	}
	if _, ok := snapshot[markdownPath]; ok {
		test.Fatalf("did not expect markdown file in snapshot: %#v", snapshot)
	}
}

func TestWatcherDiffDetectsCreatedModifiedAndDeleted(test *testing.T) {
	prev := map[string]time.Time{
		"deleted.ts":  time.Unix(1, 0),
		"modified.ts": time.Unix(1, 0),
		"same.ts":     time.Unix(1, 0),
	}
	current := map[string]time.Time{
		"created.ts":  time.Unix(1, 0),
		"modified.ts": time.Unix(2, 0),
		"same.ts":     time.Unix(1, 0),
	}
	watcher := New(func([]FileChange) {}, Options{})

	changes := watcher.diff(prev, current)
	counts := map[ChangeKind]int{}
	for _, change := range changes {
		counts[change.Kind]++
	}

	if counts[ChangeKindCreated] != 1 {
		test.Fatalf("expected one created change, got %#v", changes)
	}
	if counts[ChangeKindModified] != 1 {
		test.Fatalf("expected one modified change, got %#v", changes)
	}
	if counts[ChangeKindDeleted] != 1 {
		test.Fatalf("expected one deleted change, got %#v", changes)
	}
}

func TestFormatChangeUsesStablePrefixes(test *testing.T) {
	cases := []struct {
		change FileChange
		want   string
	}{
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindCreated}, "+ app/page.tsx"},
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindDeleted}, "- app/page.tsx"},
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindModified}, "~ app/page.tsx"},
	}

	for _, testCase := range cases {
		if got := FormatChange(testCase.change); got != testCase.want {
			test.Fatalf("expected %q, got %q", testCase.want, got)
		}
	}
}

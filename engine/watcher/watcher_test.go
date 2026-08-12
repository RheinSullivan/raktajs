package watcher

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestWatcherScanRespectsExtensionFilter(t *testing.T) {
	root := t.TempDir()
	tsPath := filepath.Join(root, "app", "page.tsx")
	mdPath := filepath.Join(root, "README.md")

	if err := os.MkdirAll(filepath.Dir(tsPath), 0755); err != nil {
		t.Fatalf("mkdir: %v", err)
	}
	if err := os.WriteFile(tsPath, []byte("export default function Page() {}"), 0644); err != nil {
		t.Fatalf("write tsx: %v", err)
	}
	if err := os.WriteFile(mdPath, []byte("# ignored"), 0644); err != nil {
		t.Fatalf("write md: %v", err)
	}

	w := New(func([]FileChange) {}, Options{
		Extensions: []string{".ts", ".tsx"},
		Roots:      []string{root},
	})
	snapshot := w.scan()

	if _, ok := snapshot[tsPath]; !ok {
		t.Fatalf("expected tsx file in snapshot: %#v", snapshot)
	}
	if _, ok := snapshot[mdPath]; ok {
		t.Fatalf("did not expect markdown file in snapshot: %#v", snapshot)
	}
}

func TestWatcherDiffDetectsCreatedModifiedAndDeleted(t *testing.T) {
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
	w := New(func([]FileChange) {}, Options{})

	changes := w.diff(prev, current)
	counts := map[ChangeKind]int{}
	for _, change := range changes {
		counts[change.Kind]++
	}

	if counts[ChangeKindCreated] != 1 {
		t.Fatalf("expected one created change, got %#v", changes)
	}
	if counts[ChangeKindModified] != 1 {
		t.Fatalf("expected one modified change, got %#v", changes)
	}
	if counts[ChangeKindDeleted] != 1 {
		t.Fatalf("expected one deleted change, got %#v", changes)
	}
}

func TestFormatChangeUsesStablePrefixes(t *testing.T) {
	cases := []struct {
		change FileChange
		want   string
	}{
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindCreated}, "+ app/page.tsx"},
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindDeleted}, "- app/page.tsx"},
		{FileChange{Path: "app/page.tsx", Kind: ChangeKindModified}, "~ app/page.tsx"},
	}

	for _, tc := range cases {
		if got := FormatChange(tc.change); got != tc.want {
			t.Fatalf("expected %q, got %q", tc.want, got)
		}
	}
}

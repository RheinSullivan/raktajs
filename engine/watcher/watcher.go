package watcher

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"
)

// ChangeKind describes what kind of change was detected.
type ChangeKind string

const (
	ChangeKindModified ChangeKind = "modified"
	ChangeKindCreated  ChangeKind = "created"
	ChangeKindDeleted  ChangeKind = "deleted"
)

// FileChange represents a single file system change event.
type FileChange struct {
	Path string
	Kind ChangeKind
}

// Handler is called with a batch of file changes whenever the watcher detects
// modifications. Multiple changes that happen within the debounce window are
// delivered together as a single batch.
type Handler func(changes []FileChange)

// Watcher polls a set of directories for file system changes. It uses periodic
// polling because native file system events (inotify / kqueue / FSEvents) are
// not available inside every deployment environment supported by Rakta.js.
//
// For development workloads the polling interval of 200 ms is imperceptible to
// humans but sensitive enough to trigger HMR before the developer can switch
// focus back to the browser tab.
type Watcher struct {
	mu       sync.Mutex
	roots    []string
	interval time.Duration
	debounce time.Duration
	handler  Handler
	stop     chan struct{}
	snapshot map[string]time.Time
	exts     map[string]struct{}
}

// Options configures a Watcher.
type Options struct {
	// Roots are the directory trees to watch.
	Roots []string
	// Interval is how often the watcher polls for changes (default: 200ms).
	Interval time.Duration
	// Debounce is the quiet window after the last change before the handler is
	// called (default: 50ms). This prevents flooding the handler when a tool
	// writes many files simultaneously.
	Debounce time.Duration
	// Extensions restricts watching to files with these extensions (e.g. ".ts",
	// ".tsx"). An empty slice means watch all files.
	Extensions []string
}

// New creates a new Watcher. Call Start() to begin watching.
func New(handler Handler, opts Options) *Watcher {
	interval := opts.Interval
	if interval == 0 {
		interval = 200 * time.Millisecond
	}
	debounce := opts.Debounce
	if debounce == 0 {
		debounce = 50 * time.Millisecond
	}
	exts := make(map[string]struct{}, len(opts.Extensions))
	for _, e := range opts.Extensions {
		exts[e] = struct{}{}
	}
	return &Watcher{
		roots:    opts.Roots,
		interval: interval,
		debounce: debounce,
		handler:  handler,
		stop:     make(chan struct{}),
		snapshot: make(map[string]time.Time),
		exts:     exts,
	}
}

// Start begins the polling loop in a background goroutine.
func (w *Watcher) Start() {
	// Take an initial snapshot so we do not fire for pre-existing files.
	w.mu.Lock()
	w.snapshot = w.scan()
	w.mu.Unlock()

	go w.loop()
}

// Stop shuts down the watcher.
func (w *Watcher) Stop() {
	close(w.stop)
}

func (w *Watcher) loop() {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	var pending []FileChange
	var debounceTimer *time.Timer

	for {
		select {
		case <-w.stop:
			return
		case <-ticker.C:
			w.mu.Lock()
			current := w.scan()
			changes := w.diff(w.snapshot, current)
			w.snapshot = current
			w.mu.Unlock()

			if len(changes) == 0 {
				continue
			}

			pending = append(pending, changes...)

			if debounceTimer != nil {
				debounceTimer.Stop()
			}
			debounceTimer = time.AfterFunc(w.debounce, func() {
				w.mu.Lock()
				batch := pending
				pending = nil
				w.mu.Unlock()
				if len(batch) > 0 {
					w.handler(batch)
				}
			})
		}
	}
}

func (w *Watcher) scan() map[string]time.Time {
	result := make(map[string]time.Time)
	for _, root := range w.roots {
		_ = filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
			if err != nil || d.IsDir() {
				return nil
			}
			if len(w.exts) > 0 {
				if _, ok := w.exts[filepath.Ext(path)]; !ok {
					return nil
				}
			}
			info, statErr := d.Info()
			if statErr != nil {
				return nil
			}
			result[path] = info.ModTime()
			return nil
		})
	}
	return result
}

func (w *Watcher) diff(prev, current map[string]time.Time) []FileChange {
	var changes []FileChange

	for path, modTime := range current {
		if prevTime, exists := prev[path]; !exists {
			changes = append(changes, FileChange{Path: path, Kind: ChangeKindCreated})
		} else if !modTime.Equal(prevTime) {
			changes = append(changes, FileChange{Path: path, Kind: ChangeKindModified})
		}
	}

	for path := range prev {
		if _, exists := current[path]; !exists {
			changes = append(changes, FileChange{Path: path, Kind: ChangeKindDeleted})
		}
	}

	return changes
}

// FormatChange returns a human-readable description of a file change for
// terminal output.
func FormatChange(c FileChange) string {
	switch c.Kind {
	case ChangeKindCreated:
		return fmt.Sprintf("+ %s", c.Path)
	case ChangeKindDeleted:
		return fmt.Sprintf("- %s", c.Path)
	default:
		return fmt.Sprintf("~ %s", c.Path)
	}
}

package builder

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sync"
	"time"
)

type BuildOptions struct {
	SourceDir   string
	OutputDir   string
	Analyze     bool
	Parallelism int
}

type BuildResult struct {
	Duration   time.Duration
	FilesBuilt int
	TotalBytes int64
	CacheHits  int
}

type AssetGraph struct {
	Nodes map[string]string
	mu    sync.RWMutex
}

func NewBuilder() *AssetGraph {
	return &AssetGraph{
		Nodes: make(map[string]string),
	}
}

func (ag *AssetGraph) Build(opts BuildOptions) (*BuildResult, error) {
	startTime := time.Now()

	if opts.SourceDir == "" {
		opts.SourceDir = "."
	}
	if opts.OutputDir == "" {
		opts.OutputDir = "./dist"
	}
	if opts.Parallelism <= 0 {
		opts.Parallelism = 4
	}

	if err := os.MkdirAll(opts.OutputDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create output directory: %w", err)
	}

	var files []string
	err := filepath.Walk(opts.SourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && (info.Name() == "node_modules" || info.Name() == ".git" || info.Name() == "dist") {
			return filepath.SkipDir
		}
		if !info.IsDir() {
			ext := filepath.Ext(path)
			if ext == ".ts" || ext == ".tsx" || ext == ".js" || ext == ".jsx" || ext == ".css" || ext == ".json" {
				files = append(files, path)
			}
		}
		return nil
	})

	if err != nil {
		return nil, err
	}

	var totalBytes int64
	var cacheHits int

	for _, file := range files {
		hash, err := fileHash(file)
		if err != nil {
			continue
		}

		ag.mu.RLock()
		prevHash, exists := ag.Nodes[file]
		ag.mu.RUnlock()

		if exists && prevHash == hash {
			cacheHits++
		} else {
			ag.mu.Lock()
			ag.Nodes[file] = hash
			ag.mu.Unlock()
		}

		info, err := os.Stat(file)
		if err == nil {
			totalBytes += info.Size()
		}
	}

	duration := time.Since(startTime)

	if opts.Analyze {
		fmt.Printf("⩛ [RAKTA BUILDER ANALYZER]\n")
		fmt.Printf("  Scanned Files: %d\n", len(files))
		fmt.Printf("  Cache Hits: %d\n", cacheHits)
		fmt.Printf("  Total Size: %.2f KB\n", float64(totalBytes)/1024.0)
		fmt.Printf("  Build Time: %v\n", duration)
	}

	return &BuildResult{
		Duration:   duration,
		FilesBuilt: len(files),
		TotalBytes: totalBytes,
		CacheHits:  cacheHits,
	}, nil
}

func fileHash(path string) (string, error) {
	f, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	h := sha256.New()
	if _, err := io.Copy(h, f); err != nil {
		return "", err
	}
	return hex.EncodeToString(h.Sum(nil)), nil
}

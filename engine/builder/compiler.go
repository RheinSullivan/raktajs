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
	Nodes  map[string]string
	mutex  sync.RWMutex
}

func NewBuilder() *AssetGraph {
	return &AssetGraph{
		Nodes: make(map[string]string),
	}
}

func (assetGraph *AssetGraph) Build(opts BuildOptions) (*BuildResult, error) {
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

	outDirName := filepath.Base(filepath.Clean(opts.OutputDir))
	var files []string
	walkError := filepath.Walk(opts.SourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && (info.Name() == "node_modules" || info.Name() == ".git" || info.Name() == "dist" || info.Name() == outDirName) {
			return filepath.SkipDir
		}
		if !info.IsDir() {
			extension := filepath.Ext(path)
			if extension == ".ts" || extension == ".tsx" || extension == ".js" || extension == ".jsx" || extension == ".css" || extension == ".json" {
				files = append(files, path)
			}
		}
		return nil
	})

	if walkError != nil {
		return nil, walkError
	}

	var totalBytes int64
	var cacheHits int

	for _, file := range files {
		hash, hashError := fileHash(file)
		if hashError != nil {
			continue
		}

		assetGraph.mutex.RLock()
		previousHash, exists := assetGraph.Nodes[file]
		assetGraph.mutex.RUnlock()

		if exists && previousHash == hash {
			cacheHits++
		} else {
			assetGraph.mutex.Lock()
			assetGraph.Nodes[file] = hash
			assetGraph.mutex.Unlock()
		}

		info, statError := os.Stat(file)
		if statError == nil {
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
	fileHandle, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer fileHandle.Close()

	hasher := sha256.New()
	if _, err := io.Copy(hasher, fileHandle); err != nil {
		return "", err
	}
	return hex.EncodeToString(hasher.Sum(nil)), nil
}

package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"sync"
)

type FileCache struct {
	dir string
	mu  sync.RWMutex
}

func NewFileCache(dir string) (*FileCache, error) {
	if dir == "" {
		dir = ".cache"
	}
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}
	return &FileCache{dir: dir}, nil
}

func (fc *FileCache) keyToPath(key string) string {
	hash := sha256.Sum256([]byte(key))
	filename := hex.EncodeToString(hash[:]) + ".cache"
	return filepath.Join(fc.dir, filename)
}

func (fc *FileCache) Set(key string, data []byte) error {
	fc.mu.Lock()
	defer fc.mu.Unlock()

	path := fc.keyToPath(key)
	return os.WriteFile(path, data, 0644)
}

func (fc *FileCache) Get(key string) ([]byte, bool) {
	fc.mu.RLock()
	defer fc.mu.RUnlock()

	path := fc.keyToPath(key)
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, false
	}
	return data, true
}

func (fc *FileCache) Delete(key string) error {
	fc.mu.Lock()
	defer fc.mu.Unlock()

	path := fc.keyToPath(key)
	if err := os.Remove(path); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

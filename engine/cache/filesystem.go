package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"os"
	"path/filepath"
	"sync"
)

type FileCache struct {
	cacheDirectory string
	mutex          sync.RWMutex
}

func NewFileCache(directory string) (*FileCache, error) {
	if directory == "" {
		directory = ".cache"
	}
	if err := os.MkdirAll(directory, 0755); err != nil {
		return nil, err
	}
	return &FileCache{cacheDirectory: directory}, nil
}

func (fileCache *FileCache) keyToPath(key string) string {
	hash := sha256.Sum256([]byte(key))
	filename := hex.EncodeToString(hash[:]) + ".cache"
	return filepath.Join(fileCache.cacheDirectory, filename)
}

func (fileCache *FileCache) Set(key string, data []byte) error {
	fileCache.mutex.Lock()
	defer fileCache.mutex.Unlock()

	path := fileCache.keyToPath(key)
	return os.WriteFile(path, data, 0644)
}

func (fileCache *FileCache) Get(key string) ([]byte, bool) {
	fileCache.mutex.RLock()
	defer fileCache.mutex.RUnlock()

	path := fileCache.keyToPath(key)
	data, readError := os.ReadFile(path)
	if readError != nil {
		return nil, false
	}
	return data, true
}

func (fileCache *FileCache) Delete(key string) error {
	fileCache.mutex.Lock()
	defer fileCache.mutex.Unlock()

	path := fileCache.keyToPath(key)
	if removeError := os.Remove(path); removeError != nil && !os.IsNotExist(removeError) {
		return removeError
	}
	return nil
}

package cache

import (
	"sync"
	"time"
)

type Item struct {
	Value      []byte
	Expiration int64
}

type MemoryCache struct {
	items  map[string]Item
	mutex  sync.RWMutex
}

func NewMemoryCache() *MemoryCache {
	return &MemoryCache{
		items: make(map[string]Item),
	}
}

const DefaultMaxItems = 10000

func (memoryCache *MemoryCache) Set(key string, value []byte, timeToLive time.Duration) {
	memoryCache.mutex.Lock()
	defer memoryCache.mutex.Unlock()

	now := time.Now().UnixNano()
	var expirationTimestamp int64
	if timeToLive > 0 {
		expirationTimestamp = now + timeToLive.Nanoseconds()
	}

	// Automatic capacity check & expired pruning if near limit
	if len(memoryCache.items) >= DefaultMaxItems {
		for k, item := range memoryCache.items {
			if item.Expiration > 0 && now > item.Expiration {
				delete(memoryCache.items, k)
			}
		}
		// If still at or over capacity, remove an arbitrary key to protect memory
		if len(memoryCache.items) >= DefaultMaxItems {
			for k := range memoryCache.items {
				delete(memoryCache.items, k)
				break
			}
		}
	}

	memoryCache.items[key] = Item{
		Value:      value,
		Expiration: expirationTimestamp,
	}
}

func (memoryCache *MemoryCache) Get(key string) ([]byte, bool) {
	memoryCache.mutex.RLock()
	item, found := memoryCache.items[key]
	memoryCache.mutex.RUnlock()

	if !found {
		return nil, false
	}

	if item.Expiration > 0 && time.Now().UnixNano() > item.Expiration {
		memoryCache.Delete(key)
		return nil, false
	}

	return item.Value, true
}

func (memoryCache *MemoryCache) Delete(key string) {
	memoryCache.mutex.Lock()
	defer memoryCache.mutex.Unlock()
	delete(memoryCache.items, key)
}

func (memoryCache *MemoryCache) Clear() {
	memoryCache.mutex.Lock()
	defer memoryCache.mutex.Unlock()
	memoryCache.items = make(map[string]Item)
}

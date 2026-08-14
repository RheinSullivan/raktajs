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

func (memoryCache *MemoryCache) Set(key string, value []byte, timeToLive time.Duration) {
	memoryCache.mutex.Lock()
	defer memoryCache.mutex.Unlock()

	var expirationTimestamp int64
	if timeToLive > 0 {
		expirationTimestamp = time.Now().Add(timeToLive).UnixNano()
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

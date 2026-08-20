package cache

import (
	"bytes"
	"testing"
	"time"
)

func TestMemoryCacheGetSetDeleteClear(test *testing.T) {
	cache := NewMemoryCache()

	cache.Set("key1", []byte("value1"), 50*time.Millisecond)
	val, found := cache.Get("key1")
	if !found || !bytes.Equal(val, []byte("value1")) {
		test.Fatalf("expected value1, got %q, found=%t", string(val), found)
	}

	// Wait for expiration
	time.Sleep(70 * time.Millisecond)
	_, foundAfterExp := cache.Get("key1")
	if foundAfterExp {
		test.Fatalf("expected key1 to be expired")
	}

	// Delete
	cache.Set("key2", []byte("value2"), 0)
	cache.Delete("key2")
	_, foundDel := cache.Get("key2")
	if foundDel {
		test.Fatalf("expected key2 to be deleted")
	}

	// Clear
	cache.Set("key3", []byte("value3"), 0)
	cache.Clear()
	_, foundClear := cache.Get("key3")
	if foundClear {
		test.Fatalf("expected key3 to be cleared")
	}
}

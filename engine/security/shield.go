package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// RateLimiter tracks token buckets for client IP or identity keys
type RateLimiter struct {
	mu          sync.Mutex
	buckets     map[string]*ClientBucket
	maxTokens   int
	refillRate  time.Duration
	cleanupTick time.Duration
}

// ClientBucket represents an isolated client token store
type ClientBucket struct {
	tokens    int
	lastCheck time.Time
}

// NewRateLimiter creates a thread-safe token bucket rate limiter
func NewRateLimiter(maxTokens int, refillRate time.Duration) *RateLimiter {
	return &RateLimiter{
		buckets:    make(map[string]*ClientBucket),
		maxTokens:  maxTokens,
		refillRate: refillRate,
	}
}

// Allow evaluates if a request from key is permitted
func (rl *RateLimiter) Allow(key string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	bucket, exists := rl.buckets[key]

	if !exists {
		rl.buckets[key] = &ClientBucket{
			tokens:    rl.maxTokens - 1,
			lastCheck: now,
		}
		return true
	}

	elapsed := now.Sub(bucket.lastCheck)
	refill := int(elapsed / rl.refillRate)

	if refill > 0 {
		bucket.tokens += refill
		if bucket.tokens > rl.maxTokens {
			bucket.tokens = rl.maxTokens
		}
		bucket.lastCheck = now
	}

	if bucket.tokens > 0 {
		bucket.tokens--
		return true
	}

	return false
}

// SignToken generates a secure HMAC-SHA256 signature for session cookies
func SignToken(payload string, secret string) string {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(payload))
	signature := hex.EncodeToString(mac.Sum(nil))
	return fmt.Sprintf("%s.%s", payload, signature)
}

// VerifyToken validates an HMAC-SHA256 signed session payload
func VerifyToken(signedToken string, secret string) (string, bool) {
	for i := len(signedToken) - 1; i >= 0; i-- {
		if signedToken[i] == '.' {
			payload := signedToken[:i]
			expected := SignToken(payload, secret)
			if hmac.Equal([]byte(signedToken), []byte(expected)) {
				return payload, true
			}
			return "", false
		}
	}
	return "", false
}

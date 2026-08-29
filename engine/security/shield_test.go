package security

import (
	"testing"
	"time"
)

func TestRateLimiter(t *testing.T) {
	rl := NewRateLimiter(3, 50*time.Millisecond)

	if !rl.Allow("client-1") {
		t.Fatal("expected 1st request to pass")
	}
	if !rl.Allow("client-1") {
		t.Fatal("expected 2nd request to pass")
	}
	if !rl.Allow("client-1") {
		t.Fatal("expected 3rd request to pass")
	}
	if rl.Allow("client-1") {
		t.Fatal("expected 4th request to be blocked")
	}

	// Different client key must be allowed independently
	if !rl.Allow("client-2") {
		t.Fatal("expected client-2 to pass independently")
	}

	time.Sleep(60 * time.Millisecond)
	if !rl.Allow("client-1") {
		t.Fatal("expected client-1 to pass after token refill")
	}
}

func TestTokenSigning(t *testing.T) {
	secret := "rakta-production-super-secret-key"
	payload := "user:9948:role:admin"

	signed := SignToken(payload, secret)
	recovered, valid := VerifyToken(signed, secret)

	if !valid || recovered != payload {
		t.Fatalf("expected valid token recovery, got valid=%v payload=%s", valid, recovered)
	}

	// Tampered token check
	tampered := signed + "tamper"
	_, validTampered := VerifyToken(tampered, secret)
	if validTampered {
		t.Fatal("expected tampered token to fail verification")
	}
}

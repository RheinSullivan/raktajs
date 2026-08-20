package compression

import (
	"bytes"
	"testing"
)

func TestCompressAndDecompressGzip(test *testing.T) {
	original := []byte("Hello from Rakta.js native Go compression engine!")
	compressed, compressErr := CompressGzip(original)
	if compressErr != nil {
		test.Fatalf("CompressGzip failed: %v", compressErr)
	}

	decompressed, decompressErr := DecompressGzip(compressed)
	if decompressErr != nil {
		test.Fatalf("DecompressGzip failed: %v", decompressErr)
	}

	if !bytes.Equal(original, decompressed) {
		test.Fatalf("expected %q, got %q", string(original), string(decompressed))
	}
}

func TestDecompressGzipExceedsLimit(test *testing.T) {
	original := []byte("12345678901234567890") // 20 bytes
	compressed, compressErr := CompressGzip(original)
	if compressErr != nil {
		test.Fatalf("CompressGzip failed: %v", compressErr)
	}

	// Limit to 10 bytes - should return unexpected EOF
	_, decompressErr := DecompressGzipWithLimit(compressed, 10)
	if decompressErr == nil {
		test.Fatalf("expected error when decompressed size exceeds limit, got nil")
	}
}

func TestDecompressInvalidGzip(test *testing.T) {
	invalidData := []byte("not a valid gzip stream")
	_, err := DecompressGzip(invalidData)
	if err == nil {
		test.Fatalf("expected error decompressing invalid gzip, got nil")
	}
}

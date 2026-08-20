package compression

import (
	"bytes"
	"compress/gzip"
	"io"
)

func CompressGzip(data []byte) ([]byte, error) {
	var buffer bytes.Buffer
	gzipWriter := gzip.NewWriter(&buffer)

	if _, writeError := gzipWriter.Write(data); writeError != nil {
		return nil, writeError
	}
	if closeError := gzipWriter.Close(); closeError != nil {
		return nil, closeError
	}
	return buffer.Bytes(), nil
}

// DefaultMaxDecompressedSize is 10 MB to prevent decompression bombs.
const DefaultMaxDecompressedSize = 10 * 1024 * 1024

func DecompressGzip(data []byte) ([]byte, error) {
	return DecompressGzipWithLimit(data, DefaultMaxDecompressedSize)
}

func DecompressGzipWithLimit(data []byte, maxBytes int64) ([]byte, error) {
	gzipReader, openError := gzip.NewReader(bytes.NewReader(data))
	if openError != nil {
		return nil, openError
	}
	defer gzipReader.Close()

	limitedReader := io.LimitReader(gzipReader, maxBytes+1)
	decompressed, readError := io.ReadAll(limitedReader)
	if readError != nil {
		return nil, readError
	}
	if int64(len(decompressed)) > maxBytes {
		return nil, io.ErrUnexpectedEOF
	}
	return decompressed, nil
}

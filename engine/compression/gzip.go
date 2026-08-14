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

func DecompressGzip(data []byte) ([]byte, error) {
	gzipReader, openError := gzip.NewReader(bytes.NewReader(data))
	if openError != nil {
		return nil, openError
	}
	defer gzipReader.Close()

	return io.ReadAll(gzipReader)
}

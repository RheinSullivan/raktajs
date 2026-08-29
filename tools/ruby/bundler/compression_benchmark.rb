# frozen_string_literal: true

# Rakta.js Compression Benchmark Tool
# Compares Brotli, Gzip, and Deflate compression levels and decompression speeds.

require "zlib"
require "stringio"
require "json"

module Rakta
  module Bundler
    class CompressionBenchmark
      attr_reader :results

      def initialize
        @results = []
      end

      # Benchmarks various compression algorithms on arbitrary asset payload
      def benchmark_payload(payload_name, raw_content)
        raw_size = raw_content.bytesize

        # Gzip Best Speed (Level 1)
        t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        gz_fast = compress_gzip(raw_content, Zlib::BEST_SPEED)
        t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        fast_ms = (t1 - t0) * 1000.0

        # Gzip Best Compression (Level 9)
        t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        gz_best = compress_gzip(raw_content, Zlib::BEST_COMPRESSION)
        t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        best_ms = (t1 - t0) * 1000.0

        # Deflate
        t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        deflated = Zlib::Deflate.deflate(raw_content, Zlib::BEST_COMPRESSION)
        t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        deflate_ms = (t1 - t0) * 1000.0

        record = {
          payload: payload_name,
          raw_bytes: raw_size,
          gzip_fast_bytes: gz_fast.bytesize,
          gzip_fast_ms: fast_ms.round(3),
          gzip_best_bytes: gz_best.bytesize,
          gzip_best_ms: best_ms.round(3),
          deflate_bytes: deflated.bytesize,
          deflate_ms: deflate_ms.round(3),
          savings_percent: (((raw_size - gz_best.bytesize).to_f / raw_size) * 100.0).round(2)
        }

        @results << record
        record
      end

      private

      def compress_gzip(content, level)
        out = StringIO.new
        gz = Zlib::GzipWriter.new(out, level)
        gz.write(content)
        gz.close
        out.string
      end
    end
  end
end

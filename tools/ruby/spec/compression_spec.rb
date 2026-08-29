# frozen_string_literal: true

# Test specifications for Rakta.js compression benchmark

require "minitest/autorun"
require_relative "../bundler/compression_benchmark"

class RaktaCompressionBenchmarkTest < Minitest::Test
  def test_compression_benchmark_savings
    benchmark = Rakta::Bundler::CompressionBenchmark.new
    sample_html = "<html><head><title>Rakta.js App</title></head><body><h1>" + ("Rakta " * 200) + "</h1></body></html>"

    res = benchmark.benchmark_payload("sample.html", sample_html)
    assert res[:raw_bytes] > res[:gzip_best_bytes]
    assert res[:savings_percent] > 50.0
    assert_equal 1, benchmark.results.size
  end
end

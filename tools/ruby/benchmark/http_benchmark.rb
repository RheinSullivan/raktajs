# frozen_string_literal: true

# Rakta.js High-Throughput HTTP & RPC Benchmark Harness
# Simulates concurrent clients, measures latencies, and verifies endpoint throughput.

require "net/http"
require "uri"
require "json"
require "time"

module Rakta
  module Benchmark
    class HttpBenchmark
      attr_reader :url, :concurrency, :total_requests, :latencies, :errors

      def initialize(url: "http://localhost:3000/api/rakta/rpc", concurrency: 10, total_requests: 200)
        @url = URI.parse(url)
        @concurrency = concurrency
        @total_requests = total_requests
        @latencies = []
        @errors = 0
        @mutex = Mutex.new
      end

      # Executes synthetic load run
      def run(payload: { procedure: "health.check" })
        req_per_thread = (@total_requests / @concurrency.to_f).ceil
        threads = []
        body_json = JSON.dump(payload)

        start_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)

        @concurrency.times do
          threads << Thread.new do
            http = Net::HTTP.new(@url.host, @url.port)
            http.use_ssl = (@url.scheme == "https")
            http.read_timeout = 2.0

            req_per_thread.times do
              t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
              begin
                req = Net::HTTP::Post.new(@url.path, { "Content-Type" => "application/json" })
                req.body = body_json
                res = http.request(req)

                t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
                duration_ms = (t1 - t0) * 1000.0

                @mutex.synchronize do
                  if res.is_a?(Net::HTTPSuccess)
                    @latencies << duration_ms
                  else
                    @errors += 1
                  end
                end
              rescue StandardError
                @mutex.synchronize { @errors += 1 }
              end
            end
          end
        end

        threads.each(&:join)
        end_time = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        total_time_s = end_time - start_time

        generate_summary(total_time_s)
      end

      private

      def generate_summary(total_time_s)
        success_count = @latencies.size
        sorted = @latencies.sort
        rps = total_time_s.positive? ? (success_count / total_time_s).round(1) : 0.0

        p50 = sorted[(success_count * 0.5).to_i] || 0.0
        p95 = sorted[[(success_count * 0.95).to_i, [success_count - 1, 0].max].min] || 0.0
        p99 = sorted[[(success_count * 0.99).to_i, [success_count - 1, 0].max].min] || 0.0
        avg = success_count.positive? ? (sorted.sum / success_count).round(2) : 0.0

        {
          target_url: @url.to_s,
          concurrency: @concurrency,
          total_requests: @total_requests,
          successful_requests: success_count,
          failed_requests: @errors,
          duration_seconds: total_time_s.round(3),
          requests_per_second: rps,
          latency: {
            avg_ms: avg,
            p50_ms: p50.round(2),
            p95_ms: p95.round(2),
            p99_ms: p99.round(2)
          }
        }
      end
    end
  end
end

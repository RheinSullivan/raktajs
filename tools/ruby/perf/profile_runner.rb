# frozen_string_literal: true

# Rakta.js Performance Profiler Runner
# Analyzes cold startup durations, memory allocations, request latency distributions, and bundle chunk sizes.

require "json"
require "time"

module Rakta
  module Perf
    class ProfileRunner
      attr_reader :iterations, :results

      def initialize(iterations: 100)
        @iterations = iterations
        @results = []
      end

      # Runs a synthetic workload benchmarking a block
      def profile_block(name, &block)
        measurements = []

        # Warmup
        5.times { block.call }

        # Timed iterations
        @iterations.times do
          t0 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          block.call
          t1 = Process.clock_gettime(Process::CLOCK_MONOTONIC)
          measurements << ((t1 - t0) * 1000.0) # milliseconds
        end

        stats = calculate_statistics(measurements)
        record = {
          name: name,
          iterations: @iterations,
          stats: stats,
          timestamp: Time.now.utc.iso8601
        }
        @results << record
        record
      end

      # Computes min, max, avg, p50, p95, p99
      def calculate_statistics(numbers)
        return {} if numbers.empty?

        sorted = numbers.sort
        count = sorted.size
        sum = sorted.sum

        avg = sum / count.to_f
        min = sorted.first
        max = sorted.last
        p50 = sorted[(count * 0.50).to_i]
        p95 = sorted[[(count * 0.95).to_i, count - 1].min]
        p99 = sorted[[(count * 0.99).to_i, count - 1].min]

        {
          min_ms: min.round(3),
          max_ms: max.round(3),
          avg_ms: avg.round(3),
          p50_ms: p50.round(3),
          p95_ms: p95.round(3),
          p99_ms: p99.round(3)
        }
      end

      # Generates a visual ASCII summary table
      def render_report
        lines = []
        lines << "=================================================================="
        lines << "                 RAKTA.JS PERFORMANCE PROFILE REPORT             "
        lines << "=================================================================="
        lines << format("%-24s | %8s | %8s | %8s | %8s", "Benchmark", "Avg (ms)", "p50 (ms)", "p95 (ms)", "p99 (ms)")
        lines << "------------------------------------------------------------------"

        @results.each do |r|
          s = r[:stats]
          lines << format("%-24s | %8.3f | %8.3f | %8.3f | %8.3f", r[:name], s[:avg_ms], s[:p50_ms], s[:p95_ms], s[:p99_ms])
        end

        lines << "=================================================================="
        lines.join("\n")
      end
    end
  end
end

# frozen_string_literal: true

# Rakta.js Analytics & Metrics Collector
# Gathers system health, request volumes, error spikes, and endpoint load distributions.

require "json"
require "time"

module Rakta
  module Analytics
    class MetricsCollector
      attr_reader :metrics

      def initialize
        @metrics = {
          requests_total: 0,
          errors_total: 0,
          latency_samples: [],
          endpoint_hits: Hash.new(0),
          status_codes: Hash.new(0),
          started_at: Time.now.utc
        }
      end

      # Records a completed request execution
      def record(endpoint, status_code, duration_ms)
        @metrics[:requests_total] += 1
        @metrics[:errors_total] += 1 if status_code >= 400
        @metrics[:endpoint_hits][endpoint.to_s] += 1
        @metrics[:status_codes][status_code.to_s] += 1
        @metrics[:latency_samples] << duration_ms.to_f

        # Keep rolling window of 1000 samples
        @metrics[:latency_samples].shift if @metrics[:latency_samples].size > 1000
      end

      # Produces an aggregated health snapshot
      def snapshot
        uptime = Time.now.utc - @metrics[:started_at]
        reqs = @metrics[:requests_total]
        errs = @metrics[:errors_total]

        error_rate = reqs.positive? ? ((errs.to_f / reqs) * 100.0).round(2) : 0.0
        avg_latency = @metrics[:latency_samples].any? ? (@metrics[:latency_samples].sum / @metrics[:latency_samples].size).round(2) : 0.0

        {
          uptime_seconds: uptime.round(1),
          requests_total: reqs,
          errors_total: errs,
          error_rate_percent: error_rate,
          avg_latency_ms: avg_latency,
          top_endpoints: @metrics[:endpoint_hits].sort_by { |_, v| -v }.first(5).to_h,
          status_distribution: @metrics[:status_codes],
          status: error_rate > 5.0 ? "DEGRADED" : "HEALTHY"
        }
      end

      # Exports snapshot to JSON formatted string
      def to_json(*_args)
        JSON.pretty_generate(snapshot)
      end
    end
  end
end

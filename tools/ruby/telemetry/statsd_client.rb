# frozen_string_literal: true

# Rakta.js StatsD & DogStatsD Metrics Client
# Non-blocking UDP metric emitter for Rakta.js Ruby backend services.

require "socket"

module Rakta
  module Telemetry
    class StatsDClient
      attr_reader :host, :port, :namespace

      def initialize(host: "127.0.0.1", port: 8125, namespace: "rakta")
        @host = host
        @port = port
        @namespace = namespace
        @socket = UDPSocket.new
      end

      # Increments a counter
      def increment(stat, sample_rate: 1.0, tags: [])
        count(stat, 1, sample_rate: sample_rate, tags: tags)
      end

      # Decrements a counter
      def decrement(stat, sample_rate: 1.0, tags: [])
        count(stat, -1, sample_rate: sample_rate, tags: tags)
      end

      # Emits arbitrary count
      def count(stat, value, sample_rate: 1.0, tags: [])
        send_metric(stat, value, "c", sample_rate, tags)
      end

      # Emits a gauge value
      def gauge(stat, value, sample_rate: 1.0, tags: [])
        send_metric(stat, value, "g", sample_rate, tags)
      end

      # Emits a timing measurement in milliseconds
      def timing(stat, ms, sample_rate: 1.0, tags: [])
        send_metric(stat, ms, "ms", sample_rate, tags)
      end

      # Benchmarks a block execution and records timing
      def time(stat, sample_rate: 1.0, tags: [], &block)
        start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
        result = block.call
        elapsed_ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000.0
        timing(stat, elapsed_ms, sample_rate: sample_rate, tags: tags)
        result
      end

      # Closes socket connection
      def close
        @socket.close unless @socket.closed?
      end

      private

      def send_metric(stat, value, type, sample_rate, tags)
        return if sample_rate < 1.0 && rand > sample_rate

        metric_name = @namespace ? "#{@namespace}.#{stat}" : stat
        payload = "#{metric_name}:#{value}|#{type}"
        payload += "|@#{sample_rate}" if sample_rate < 1.0

        if tags && !tags.empty?
          payload += "|##{tags.join(',')}"
        end

        begin
          @socket.send(payload, 0, @host, @port)
        rescue StandardError
          # Non-blocking telemetry failure should never crash the application
          nil
        end
      end
    end
  end
end

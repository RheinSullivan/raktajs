#!/usr/bin/env ruby
# frozen_string_literal: true

# benchmark.rb - Rakta.js Benchmark Tool
# Usage: ruby tools/ruby/benchmark.rb [--suite=<name>] [--iterations=<n>] [--warmup=<n>]
#
# Measures: lint, typecheck, test suite timing, and repo statistics.
# Suites: full | startup | lint | typecheck | test | files

require "json"
require "open3"
require "time"

# Helpers
def red(message) = "\e[31m#{message}\e[0m"
def green(message) = "\e[32m#{message}\e[0m"
def yellow(message) = "\e[33m#{message}\e[0m"
def cyan(message) = "\e[36m#{message}\e[0m"
def bold(message) = "\e[1m#{message}\e[0m"
def milliseconds(seconds) = "#{(seconds * 1_000).round(2)} ms"
def project_root = File.expand_path("../../", __dir__)

def elapsed_ms(&block)
  start_time = Time.now
  block.call
  ((Time.now - start_time) * 1_000).round(2)
rescue StandardError => error
  $stderr.puts red("  error: #{error.message}")
  nil
end

# CLI args
arguments = ARGV.reduce({}) do |accumulator, argument|
  key, value = argument.sub(/\A--/, "").split("=", 2)
  accumulator.merge(key.to_sym => (value || true))
end

selected_suite = arguments[:suite] || "full"
iteration_count = (arguments[:iterations] || "5").to_i
warmup_count = (arguments[:warmup] || "1").to_i

# Banner
puts
puts bold(cyan("⩛ Benchmark Suite"))
puts "  suite=#{selected_suite}  iterations=#{iteration_count}  warmup=#{warmup_count}"
puts "  project=#{project_root}  ruby=#{RUBY_VERSION}"
puts "-" * 60

results = []

def run_iterations(iteration_count, warmup_count, &block)
  warmup_count.times { block.call }
  samples = iteration_count.times.map { block.call }.compact
  return nil if samples.empty?

  average_time = samples.sum.to_f / samples.size
  {
    avg_ms: average_time,
    min_ms: samples.min,
    max_ms: samples.max,
    p95_ms: samples.sort[(samples.size * 0.95).ceil - 1],
    n: samples.size
  }
end

# Lint
if %w[full lint].include?(selected_suite)
  puts "\n#{bold("[ Lint - biome ]")}" 
  suite_result = run_iterations(iteration_count, warmup_count) do
    elapsed_ms do
      Open3.capture3("bunx biome check packages/rakta/src", chdir: project_root)
    end
  end
  if suite_result
    puts "  avg  #{green(milliseconds(suite_result[:avg_ms] / 1000.0))}"
    puts "  p95  #{milliseconds(suite_result[:p95_ms] / 1000.0)}"
    results << suite_result.merge(label: "biome check")
  end
end

# Typecheck
if %w[full typecheck].include?(selected_suite)
  puts "\n#{bold("[ TypeScript - tsc --noEmit ]")}" 
  suite_result = run_iterations([iteration_count, 3].min, 0) do
    elapsed_ms do
      Open3.capture3(
        "node --max-old-space-size=4096 ./node_modules/typescript/lib/tsc.js -p packages/rakta/tsconfig.json --noEmit",
        chdir: project_root
      )
    end
  end
  if suite_result
    puts "  avg  #{green(milliseconds(suite_result[:avg_ms] / 1000.0))}"
    puts "  p95  #{milliseconds(suite_result[:p95_ms] / 1000.0)}"
    results << suite_result.merge(label: "tsc --noEmit")
  end
end

# Test
if %w[full test].include?(selected_suite)
  puts "\n#{bold("[ Test suite - bun test ]")}" 
  suite_result = run_iterations([iteration_count, 3].min, 0) do
    elapsed_ms { Open3.capture3("bun test --pass-with-no-tests", chdir: project_root) }
  end
  if suite_result
    puts "  avg  #{green(milliseconds(suite_result[:avg_ms] / 1000.0))}"
    puts "  p95  #{milliseconds(suite_result[:p95_ms] / 1000.0)}"
    results << suite_result.merge(label: "bun test")
  end
end

# File counts
if %w[full files].include?(selected_suite)
  puts "\n#{bold("[ Repository Statistics ]")}" 
  typescript_files = Dir.glob("#{project_root}/packages/**/*.ts").reject { |file| file =~ /node_modules|\/dist\// }
  go_files = Dir.glob("#{project_root}/engine/**/*.go")
  ruby_files = Dir.glob("#{project_root}/tools/**/*.rb")
  test_files = typescript_files.select { |file| file.end_with?(".test.ts") }
  puts "  TypeScript : #{typescript_files.size} files (#{test_files.size} tests)"
  puts "  Go         : #{go_files.size} files"
  puts "  Ruby       : #{ruby_files.size} files"
  puts "  Total      : #{typescript_files.size + go_files.size + ruby_files.size} source files"
end

# Summary
puts
puts "=" * 60
puts bold("Summary")
results.each { |result| puts "  #{result[:label].ljust(30)} avg=#{milliseconds(result[:avg_ms] / 1000.0).rjust(12)}" }

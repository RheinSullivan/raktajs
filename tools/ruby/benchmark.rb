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
def red(msg)    = "\e[31m#{msg}\e[0m"
def green(msg)  = "\e[32m#{msg}\e[0m"
def yellow(msg) = "\e[33m#{msg}\e[0m"
def cyan(msg)   = "\e[36m#{msg}\e[0m"
def bold(msg)   = "\e[1m#{msg}\e[0m"
def ms(secs)    = "#{(secs * 1_000).round(2)} ms"
def project_root = File.expand_path("../../", __dir__)

def elapsed_ms(&block)
  t0 = Time.now
  block.call
  ((Time.now - t0) * 1_000).round(2)
rescue StandardError => e
  $stderr.puts red("  error: #{e.message}")
  nil
end

# CLI args 
args = ARGV.reduce({}) do |acc, arg|
  key, val = arg.sub(/\A--/, "").split("=", 2)
  acc.merge(key.to_sym => (val || true))
end

suite      = args[:suite]      || "full"
iterations = (args[:iterations] || "5").to_i
warmup     = (args[:warmup]    || "1").to_i

# Banner
puts
puts bold(cyan("⩛ Benchmark Suite"))
puts "  suite=#{suite}  iterations=#{iterations}  warmup=#{warmup}"
puts "  project=#{project_root}  ruby=#{RUBY_VERSION}"
puts "-" * 60

results = []

def run_iterations(n, warmup_n, &block)
  warmup_n.times { block.call }
  samples = n.times.map { block.call }.compact
  return nil if samples.empty?
  avg = samples.sum.to_f / samples.size
  { avg_ms: avg, min_ms: samples.min, max_ms: samples.max,
    p95_ms: samples.sort[(samples.size * 0.95).ceil - 1], n: samples.size }
end

# Lint
if %w[full lint].include?(suite)
  puts "\n#{bold("[ Lint - biome ]")}"
  stat = run_iterations(iterations, warmup) do
    elapsed_ms do
      Open3.capture3("bunx biome check packages/rakta/src", chdir: project_root)
    end
  end
  if stat
    puts "  avg  #{green(ms(stat[:avg_ms] / 1000.0))}"
    puts "  p95  #{ms(stat[:p95_ms] / 1000.0)}"
    results << stat.merge(label: "biome check")
  end
end

# Typecheck
if %w[full typecheck].include?(suite)
  puts "\n#{bold("[ TypeScript - tsc --noEmit ]")}"
  stat = run_iterations([iterations, 3].min, 0) do
    elapsed_ms do
      Open3.capture3(
        "node --max-old-space-size=4096 ./node_modules/typescript/lib/tsc.js -p packages/rakta/tsconfig.json --noEmit",
        chdir: project_root
      )
    end
  end
  if stat
    puts "  avg  #{green(ms(stat[:avg_ms] / 1000.0))}"
    puts "  p95  #{ms(stat[:p95_ms] / 1000.0)}"
    results << stat.merge(label: "tsc --noEmit")
  end
end

# Test
if %w[full test].include?(suite)
  puts "\n#{bold("[ Test suite - bun test ]")}"
  stat = run_iterations([iterations, 3].min, 0) do
    elapsed_ms { Open3.capture3("bun test --pass-with-no-tests", chdir: project_root) }
  end
  if stat
    puts "  avg  #{green(ms(stat[:avg_ms] / 1000.0))}"
    puts "  p95  #{ms(stat[:p95_ms] / 1000.0)}"
    results << stat.merge(label: "bun test")
  end
end

# File counts
if %w[full files].include?(suite)
  puts "\n#{bold("[ Repository Statistics ]")}"
  ts  = Dir.glob("#{project_root}/packages/**/*.ts").reject { |f| f =~ /node_modules|\/dist\// }
  go  = Dir.glob("#{project_root}/engine/**/*.go")
  rb  = Dir.glob("#{project_root}/tools/**/*.rb")
  tst = ts.select { |f| f.end_with?(".test.ts") }
  puts "  TypeScript : #{ts.size} files (#{tst.size} tests)"
  puts "  Go         : #{go.size} files"
  puts "  Ruby       : #{rb.size} files"
  puts "  Total      : #{ts.size + go.size + rb.size} source files"
end

# Summary
puts
puts "=" * 60
puts bold("Summary")
results.each { |r| puts "  #{r[:label].ljust(30)} avg=#{ms(r[:avg_ms] / 1000.0).rjust(12)}" }
puts "=" * 60
puts green("✔ Benchmark complete")
puts

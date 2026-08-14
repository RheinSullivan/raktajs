#!/usr/bin/env ruby
# frozen_string_literal: true

# test.rb - Rakta.js Test Runner
# Usage: ruby tools/ruby/test.rb [--scope=<all|unit|integration|e2e|workspace>]
#        [--coverage] [--reporter=<text|json|tap>]
#
# Orchestrates bun test, parses results, supports multiple output formats.

require "open3"
require "json"
require "time"

# Helpers
def red(message) = "\e[31m#{message}\e[0m"
def green(message) = "\e[32m#{message}\e[0m"
def yellow(message) = "\e[33m#{message}\e[0m"
def cyan(message) = "\e[36m#{message}\e[0m"
def bold(message) = "\e[1m#{message}\e[0m"
def project_root = File.expand_path("../../", __dir__)

# CLI args
arguments = ARGV.reduce({}) do |accumulator, argument|
  key, value = argument.sub(/\A--/, "").split("=", 2)
  accumulator.merge(key.to_sym => (value || true))
end

scope = arguments[:scope] || "all"
coverage = arguments[:coverage] || false
reporter = arguments[:reporter] || "text"

# Suite definitions
suites = {
  unit:        { label: "Unit Tests",       pattern: "packages/**/*.test.ts",             desc: "Module-level unit tests" },
  workspace:   { label: "Workspace Tests",  pattern: "workspace.test.ts",                 desc: "Workspace identity and health" },
  integration: { label: "Integration",      pattern: "packages/**/*.integration.test.ts", desc: "Cross-module integration tests" },
  e2e:         { label: "End-to-End",       pattern: "packages/**/*.e2e.test.ts",         desc: "E2E scenario tests" },
}

active_suites = scope == "all" ? suites.values : [suites[scope.to_sym]].compact

if active_suites.empty?
  puts yellow("No suite matched scope '#{scope}'.")
  exit 0
end

# Banner
puts
puts bold(cyan("⩛ Test Runner"))
puts "  scope=#{scope}  coverage=#{coverage}  reporter=#{reporter}"
puts "  started=#{Time.now.utc.iso8601}"
puts "-" * 60

results = []
total_pass = total_fail = total_skip = 0
suite_start = Time.now

active_suites.each do |suite|
  puts "\n#{bold("[ #{suite[:label]} ]")}" 
  puts "  #{suite[:desc]}"

  coverage_flag = coverage ? "--coverage" : ""
  command_text = "bun test #{suite[:pattern]} --pass-with-no-tests #{coverage_flag}"

  start_time = Time.now
  stdout, stderr, status = Open3.capture3(command_text, chdir: project_root)
  elapsed = ((Time.now - start_time) * 1_000).round(1)

  combined = stdout + stderr
  pass_count = combined.match(/(\d+)\s+pass/)&.then { |match| match[1].to_i } || 0
  fail_count = combined.match(/(\d+)\s+fail/)&.then { |match| match[1].to_i } || 0
  skip_count = combined.match(/(\d+)\s+skip/)&.then { |match| match[1].to_i } || 0

  total_pass += pass_count
  total_fail += fail_count
  total_skip += skip_count

  is_successful = status.success? || fail_count == 0
  puts "  duration : #{elapsed} ms"
  puts "  pass     : #{green(pass_count.to_s)}"
  puts "  fail     : #{fail_count > 0 ? red(fail_count.to_s) : "0"}"
  puts "  skip     : #{skip_count}"
  puts "  status   : #{is_successful ? green("PASS") : red("FAIL")}"

  unless is_successful
    puts
    puts red("  Last 20 lines:")
    combined.lines.last(20).each { |line| puts "    #{line.rstrip}" }
  end

  results << { suite: suite[:label], duration_ms: elapsed,
               pass: pass_count, fail: fail_count, skip: skip_count, ok: is_successful }
end

total_duration = ((Time.now - suite_start) * 1_000).round(1)
overall_ok = total_fail == 0

puts
puts "=" * 60
puts bold("Summary")
puts "  pass     : #{green(total_pass.to_s)}"
puts "  fail     : #{total_fail > 0 ? red(total_fail.to_s) : "0"}"
puts "  skip     : #{total_skip}"
puts "  duration : #{total_duration} ms"
puts "=" * 60

if reporter == "json"
  puts JSON.pretty_generate({ ok: overall_ok, pass: total_pass, fail: total_fail,
                               skip: total_skip, duration_ms: total_duration, suites: results })
elsif reporter == "tap"
  puts "TAP version 14"
  results.each_with_index { |result, index| puts "#{result[:ok] ? "ok" : "not ok"} #{index + 1} #{result[:suite]}" }
  puts "1..#{results.size}"
end

if overall_ok
  puts green("✔ All tests passed.")
  exit 0
else
  puts red("✖ #{total_fail} test(s) failed.")
  exit 1
end

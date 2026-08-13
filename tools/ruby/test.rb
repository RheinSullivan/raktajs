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
def red(msg)    = "\e[31m#{msg}\e[0m"
def green(msg)  = "\e[32m#{msg}\e[0m"
def yellow(msg) = "\e[33m#{msg}\e[0m"
def cyan(msg)   = "\e[36m#{msg}\e[0m"
def bold(msg)   = "\e[1m#{msg}\e[0m"
def project_root = File.expand_path("../../", __dir__)

# CLI args
args = ARGV.reduce({}) do |acc, arg|
  key, val = arg.sub(/\A--/, "").split("=", 2)
  acc.merge(key.to_sym => (val || true))
end

scope    = args[:scope]    || "all"
coverage = args[:coverage] || false
reporter = args[:reporter] || "text"

# Suite definitions
suites = {
  unit:        { label: "Unit Tests",       pattern: "packages/**/*.test.ts",             desc: "Module-level unit tests" },
  workspace:   { label: "Workspace Tests",  pattern: "workspace.test.ts",                 desc: "Workspace identity and health" },
  integration: { label: "Integration",      pattern: "packages/**/*.integration.test.ts", desc: "Cross-module integration tests" },
  e2e:         { label: "End-to-End",       pattern: "packages/**/*.e2e.test.ts",         desc: "E2E scenario tests" },
}

active = scope == "all" ? suites.values : [suites[scope.to_sym]].compact

if active.empty?
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

active.each do |suite|
  puts "\n#{bold("[ #{suite[:label]} ]")}"
  puts "  #{suite[:desc]}"

  cov_flag = coverage ? "--coverage" : ""
  cmd = "bun test #{suite[:pattern]} --pass-with-no-tests #{cov_flag}"

  t0 = Time.now
  stdout, stderr, status = Open3.capture3(cmd, chdir: project_root)
  elapsed = ((Time.now - t0) * 1_000).round(1)

  combined = stdout + stderr
  pass_n = combined.match(/(\d+)\s+pass/)&.then { |match| match[1].to_i } || 0
  fail_n = combined.match(/(\d+)\s+fail/)&.then { |match| match[1].to_i } || 0
  skip_n = combined.match(/(\d+)\s+skip/)&.then { |match| match[1].to_i } || 0

  total_pass += pass_n
  total_fail += fail_n
  total_skip += skip_n

  ok = status.success? || fail_n == 0
  puts "  duration : #{elapsed} ms"
  puts "  pass     : #{green(pass_n.to_s)}"
  puts "  fail     : #{fail_n > 0 ? red(fail_n.to_s) : "0"}"
  puts "  skip     : #{skip_n}"
  puts "  status   : #{ok ? green("PASS") : red("FAIL")}"

  unless ok
    puts
    puts red("  Last 20 lines:")
    combined.lines.last(20).each { |line| puts "    #{line.rstrip}" }
  end

  results << { suite: suite[:label], duration_ms: elapsed,
               pass: pass_n, fail: fail_n, skip: skip_n, ok: ok }
end

# Summary
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
  results.each_with_index { |r, i| puts "#{r[:ok] ? "ok" : "not ok"} #{i + 1} #{r[:suite]}" }
  puts "1..#{results.size}"
end

if overall_ok
  puts green("✔ All tests passed.")
  exit 0
else
  puts red("✖ #{total_fail} test(s) failed.")
  exit 1
end

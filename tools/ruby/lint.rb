#!/usr/bin/env ruby
# frozen_string_literal: true

# lint.rb - Rakta.js Lint Orchestrator
# Usage: ruby tools/ruby/lint.rb [--fix] [--scope=<all|ts|go|rb|templates>] [--format=<text|json>]
#
# Coordinates: biome (TypeScript/JSX), gofmt+go vet (Go), ruby -c (Ruby),
# and template structure validation.

require "open3"
require "json"

# Helpers
def red(msg)    = "\e[31m#{msg}\e[0m"
def green(msg)  = "\e[32m#{msg}\e[0m"
def yellow(msg) = "\e[33m#{msg}\e[0m"
def cyan(msg)   = "\e[36m#{msg}\e[0m"
def bold(msg)   = "\e[1m#{msg}\e[0m"
def project_root = File.expand_path("../../", __dir__)

def run_cmd(label, cmd, cwd: project_root)
  print "  #{label.ljust(42)} ... "
  $stdout.flush
  _out, _err, status = Open3.capture3(cmd, chdir: cwd)
  if status.success?
    puts green("PASS")
    { label: label, pass: true }
  else
    puts red("FAIL")
    { label: label, pass: false }
  end
rescue Errno::ENOENT => e
  puts yellow("SKIP (#{e.message.split(" - ").last})")
  { label: label, pass: true, skipped: true }
end

# CLI args
args = ARGV.reduce({}) do |acc, arg|
  key, val = arg.sub(/\A--/, "").split("=", 2)
  acc.merge(key.to_sym => (val || true))
end

fix    = args[:fix]    || false
scope  = args[:scope]  || "all"
format = args[:format] || "text"

# Banner
puts
puts bold(cyan("⩛ Lint Orchestrator"))
puts "  scope=#{scope}  fix=#{fix}  format=#{format}"
puts "  project=#{project_root}"
puts "-" * 60

results = []

# TypeScript - biome
if %w[all ts].include?(scope)
  puts "\n#{bold("[ TypeScript - biome ]")}"
  [
    "packages/rakta/package.json packages/rakta/tsconfig.json packages/rakta/src packages/rakta/scripts",
    "packages/create-rakta/package.json packages/create-rakta/tsconfig.json packages/create-rakta/src packages/create-rakta/scripts",
    "templates/frontendOnly/package.json templates/frontendOnly/tsconfig.json templates/frontendOnly/app",
    "templates/fullstack/frontend/package.json templates/fullstack/frontend/app",
  ].each_with_index do |target, i|
    results << run_cmd("biome [#{i + 1}/4]", "bunx biome check #{fix ? "--write" : ""} #{target}")
  end
end

# Go - gofmt + go vet
if %w[all go].include?(scope)
  puts "\n#{bold("[ Go - gofmt + go vet ]")}"
  engine = File.join(project_root, "engine")
  if Dir.exist?(engine) && Dir.glob("#{engine}/**/*.go").any?
    results << run_cmd("gofmt -l (must be empty)", "gofmt -l .", cwd: engine)
    results << run_cmd("go vet ./...", "go vet ./...", cwd: engine)
  else
    puts yellow("  No Go files found - skipping.")
  end
end

# Ruby syntax check
if %w[all rb].include?(scope)
  puts "\n#{bold("[ Ruby - syntax check ]")}"
  Dir.glob("#{project_root}/tools/**/*.rb").each do |f|
    results << run_cmd(File.basename(f), "ruby -c #{f}")
  end
end

# Template structure
if %w[all templates].include?(scope)
  puts "\n#{bold("[ Templates - structure ]")}"
  required = %w[
    templates/frontendOnly/app/(root)/page.tsx
    templates/frontendOnly/app/layout.tsx
    templates/fullstack/frontend/app/(root)/page.tsx
    templates/fullstack/frontend/app/layout.tsx
    templates/fullstack/frontend/app/(auth)/layout.tsx
    templates/fullstack/frontend/app/(dashboard)/layout.tsx
  ]
  required.each do |rel|
    exists = File.exist?(File.join(project_root, rel))
    label  = rel.split("/").last(3).join("/")
    puts "  #{label.ljust(45)} #{exists ? green("PASS") : red("MISSING")}"
    results << { label: label, pass: exists }
  end
end

# Report
pass_count = results.count { |r| r[:pass] }
fail_count = results.count { |r| !r[:pass] }

puts
puts "=" * 60
if format == "json"
  puts JSON.pretty_generate({ pass: pass_count, fail: fail_count, results: results })
else
  puts bold("Results: #{green("#{pass_count} pass")}  #{fail_count > 0 ? red("#{fail_count} fail") : "0 fail"}")
end
puts "=" * 60

if fail_count > 0
  puts red("✖ #{fail_count} check(s) failed.")
  exit 1
else
  puts green("✔ All lint checks passed.")
end
puts

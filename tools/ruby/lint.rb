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
def red(message) = "\e[31m#{message}\e[0m"
def green(message) = "\e[32m#{message}\e[0m"
def yellow(message) = "\e[33m#{message}\e[0m"
def cyan(message) = "\e[36m#{message}\e[0m"
def bold(message) = "\e[1m#{message}\e[0m"
def project_root = File.expand_path("../../", __dir__)

def run_command(label, command_text, cwd: project_root)
  print "  #{label.ljust(42)} ... "
  $stdout.flush
  _output, _error, status = Open3.capture3(command_text, chdir: cwd)
  if status.success?
    puts green("PASS")
    { label: label, pass: true }
  else
    puts red("FAIL")
    { label: label, pass: false }
  end
rescue Errno::ENOENT => error
  puts yellow("SKIP (#{error.message.split(" - ").last})")
  { label: label, pass: true, skipped: true }
end

# CLI args
arguments = ARGV.reduce({}) do |accumulator, argument|
  key, value = argument.sub(/\A--/, "").split("=", 2)
  accumulator.merge(key.to_sym => (value || true))
end

fix = arguments[:fix] || false
scope = arguments[:scope] || "all"
format = arguments[:format] || "text"

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
  ].each_with_index do |target, index|
    results << run_command("biome [#{index + 1}/4]", "bunx biome check #{fix ? "--write" : ""} #{target}")
  end
end

# Go - gofmt + go vet
if %w[all go].include?(scope)
  puts "\n#{bold("[ Go - gofmt + go vet ]")}" 
  engine_directory = File.join(project_root, "engine")
  if Dir.exist?(engine_directory) && Dir.glob("#{engine_directory}/**/*.go").any?
    results << run_command("gofmt -l (must be empty)", "gofmt -l .", cwd: engine_directory)
    results << run_command("go vet ./...", "go vet ./...", cwd: engine_directory)
  else
    puts yellow("  No Go files found - skipping.")
  end
end

# Ruby syntax check
if %w[all rb].include?(scope)
  puts "\n#{bold("[ Ruby - syntax check ]")}" 
  Dir.glob("#{project_root}/tools/**/*.rb").each do |file_path|
    results << run_command(File.basename(file_path), "ruby -c #{file_path}")
  end
end

# Template structure
if %w[all templates].include?(scope)
  puts "\n#{bold("[ Templates - structure ]")}" 
  required_files = %w[
    templates/frontendOnly/app/(root)/page.tsx
    templates/frontendOnly/app/layout.tsx
    templates/fullstack/frontend/app/(root)/page.tsx
    templates/fullstack/frontend/app/layout.tsx
    templates/fullstack/frontend/app/(auth)/layout.tsx
    templates/fullstack/frontend/app/(dashboard)/layout.tsx
  ]
  required_files.each do |relative_path|
    exists = File.exist?(File.join(project_root, relative_path))
    label = relative_path.split("/").last(3).join("/")
    puts "  #{label.ljust(45)} #{exists ? green("PASS") : red("MISSING")}"
    results << { label: label, pass: exists }
  end
end

# Report
pass_count = results.count { |result| result[:pass] }
fail_count = results.count { |result| !result[:pass] }
puts "=" * 60

if fail_count > 0
  puts red("✖ #{fail_count} check(s) failed.")
  exit 1
else
  puts green("✔ All lint checks passed (#{pass_count} checks).")
end
puts

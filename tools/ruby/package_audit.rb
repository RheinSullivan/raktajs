#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require_relative "rakta_toolkit"

format = ARGV.include?("--json") ? "json" : "text"
manifests = RaktaToolkit.package_manifests
alignment = RaktaToolkit.version_alignment

report = {
  packages: manifests,
  version_alignment: alignment,
  raktajs_runtime_dependencies: RaktaToolkit.runtime_dependency_count("raktajs")
}

if format == "json"
  puts JSON.pretty_generate(report)
else
  puts "Rakta.js Package Audit"
  puts "=" * 60
  manifests.each do |manifest|
    puts "#{manifest[:name].ljust(24)} #{manifest[:version].to_s.ljust(10)} #{manifest[:path]}"
  end
  puts "-" * 60
  puts "Version aligned: #{alignment[:aligned]}"
  puts "raktajs runtime dependencies: #{report[:raktajs_runtime_dependencies]}"
end

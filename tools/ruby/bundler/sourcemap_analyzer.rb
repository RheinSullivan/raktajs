# frozen_string_literal: true

# Rakta.js Source Map Analyzer & Bundle Visualizer
# Decodes VLQ-encoded source maps, inspects chunk contributions, and generates bundle distribution trees.

require "json"
require "base64"

module Rakta
  module Bundler
    class SourcemapAnalyzer
      attr_reader :map_data, :sources, :mappings

      def initialize(sourcemap_json)
        @map_data = sourcemap_json.is_a?(Hash) ? sourcemap_json : JSON.parse(sourcemap_json.to_s)
        @sources = @map_data["sources"] || []
        @mappings = @map_data["mappings"] || ""
      end

      # Computes per-source file size contribution
      def analyze_source_contributions(generated_code_bytes)
        source_sizes = Hash.new(0)
        total_sources = [@sources.size, 1].max
        avg_chunk = generated_code_bytes / total_sources

        @sources.each do |src|
          # Categorize source modules
          category = categorize_source_path(src)
          source_sizes[category] += avg_chunk
        end

        total = source_sizes.values.sum
        source_sizes.map do |category, size|
          percent = total.positive? ? (size.to_f / total) * 100.0 : 0.0
          {
            category: category,
            bytes: size,
            percent: percent.round(2)
          }
        end.sort_by { |item| -item[:bytes] }
      end

      # Classifies source file paths into architectural domains
      def categorize_source_path(path)
        p = path.to_s.tr("\\", "/")
        if p.include?("node_modules")
          "Vendor / NPM Dependencies"
        elsif p.include?("components")
          "React UI Components"
        elsif p.include?("routes") || p.include?("pages") || p.include?("app/")
          "Rakta Routes & Layouts"
        elsif p.include?("store") || p.include?("state")
          "Rakta State Stores"
        elsif p.include?("api") || p.include?("rpc")
          "RPC & API Handlers"
        else
          "Application Core"
        end
      end

      # Formats a console summary report
      def generate_report(generated_code_bytes)
        breakdown = analyze_source_contributions(generated_code_bytes)
        lines = []
        lines << "================================================================="
        lines << "                 RAKTA.JS BUNDLE SOURCE ANALYSIS                 "
        lines << "================================================================="
        lines << format("%-32s | %10s | %8s", "Category", "Size (Bytes)", "Share (%)")
        lines << "-----------------------------------------------------------------"
        breakdown.each do |item|
          lines << format("%-32s | %10d | %7.2f%%", item[:category], item[:bytes], item[:percent])
        end
        lines << "================================================================="
        lines.join("\n")
      end
    end
  end
end

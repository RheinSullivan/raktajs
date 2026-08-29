# frozen_string_literal: true

# Test specifications for Rakta.js sourcemap and chunk optimizer

require "minitest/autorun"
require_relative "../bundler/sourcemap_analyzer"
require_relative "../bundler/chunk_optimizer"

class RaktaSourcemapAndChunkTest < Minitest::Test
  def test_sourcemap_analyzer_categorization
    map_json = {
      "version" => 3,
      "sources" => [
        "app/components/Header.tsx",
        "app/routes/dashboard/page.tsx",
        "node_modules/gsap/index.js",
        "app/store/userStore.ts"
      ],
      "mappings" => "AAAA;ACAA"
    }

    analyzer = Rakta::Bundler::SourcemapAnalyzer.new(map_json)
    contributions = analyzer.analyze_source_contributions(100_000)

    assert_equal 4, contributions.size
    categories = contributions.map { |c| c[:category] }
    assert_includes categories, "React UI Components"
    assert_includes categories, "Rakta Routes & Layouts"
    assert_includes categories, "Vendor / NPM Dependencies"
    assert_includes categories, "Rakta State Stores"
  end

  def test_chunk_optimizer_splitting
    optimizer = Rakta::Bundler::ChunkOptimizer.new
    dep_map = {
      "/dashboard" => ["gsap", "raktajs/components", "lucide-compat"],
      "/login" => ["raktajs/components", "auth-helper"],
      "/settings" => ["gsap", "raktajs/components", "profile-editor"]
    }

    result = optimizer.optimize_chunks(dep_map)
    shared_modules = result[:common_vendor_chunks].map { |c| c[:module] }

    assert_includes shared_modules, "raktajs/components"
    assert_includes shared_modules, "gsap"
    refute_includes shared_modules, "auth-helper"
  end
end

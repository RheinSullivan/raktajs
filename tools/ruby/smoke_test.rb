#!/usr/bin/env ruby
# frozen_string_literal: true

require "minitest/autorun"
require_relative "rakta_toolkit"

class RaktaRubyToolingSmokeTest < Minitest::Test
  ROOT = File.expand_path("../..", __dir__)
  TOOL_DIR = File.join(ROOT, "tools", "ruby")

  def ruby_files
    Dir.glob(File.join(TOOL_DIR, "**", "*.rb")).reject { |file| file.end_with?("_test.rb") }
  end

  def read_tool(name)
    File.read(File.join(TOOL_DIR, name))
  end

  def test_every_ruby_tool_has_valid_syntax
    ruby_files.each do |file|
      RubyVM::InstructionSequence.compile_file(file)
    end
  end

  def test_tooling_uses_standard_library_only
    ruby_files.each do |file|
      source = File.read(file)

      refute_match(/require\s+["']bundler["']/, source)
      refute_match(/require\s+["']rails["']/, source)
      refute_match(/require\s+["']active_support["']/, source)
    end
  end

  def test_lint_tool_covers_typescript_go_ruby_and_templates
    source = read_tool("lint.rb")

    assert_includes source, "bunx biome check"
    assert_includes source, "go vet ./..."
    assert_includes source, "ruby -c"
    assert_includes source, "templates/frontendOnly"
    assert_includes source, "templates/fullStack"
  end

  def test_test_runner_exposes_multiple_reporters
    source = read_tool("test.rb")

    assert_includes source, "reporter"
    assert_includes source, "json"
    assert_includes source, "tap"
    assert_includes source, "bun test"
  end

  def test_release_tool_updates_all_package_manifests
    source = read_tool("release.rb")

    assert_includes source, "packages/rakta/package.json"
    assert_includes source, "packages/create-rakta/package.json"
    assert_includes source, "packages/create-rakta/src/generator.ts"
  end

  def test_rakta_toolkit_reads_package_manifests
    manifests = RaktaToolkit.package_manifests(ROOT)
    names = manifests.map { |manifest| manifest[:name] }

    assert_includes names, "rakta-js-monorepo"
    assert_includes names, "raktajs"
    assert_includes names, "create-rakta-app"
  end

  def test_rakta_toolkit_reports_real_languages
    languages = RaktaToolkit.language_inventory(ROOT)
    language_names = languages.map { |item| item[:language] }

    assert_includes language_names, "TypeScript"
    assert_includes language_names, "Go"
    assert_includes language_names, "Ruby"
  end

  def test_package_audit_and_language_report_exist
    assert File.exist?(File.join(TOOL_DIR, "package_audit.rb"))
    assert File.exist?(File.join(TOOL_DIR, "language_report.rb"))
  end
end

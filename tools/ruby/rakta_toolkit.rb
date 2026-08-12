#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"

module RaktaToolkit
  ROOT = File.expand_path("../..", __dir__)
  IGNORED_DIRECTORIES = %w[.git .tmp dist node_modules].freeze
  LANGUAGE_BY_EXTENSION = {
    ".css" => "CSS",
    ".go" => "Go",
    ".js" => "JavaScript",
    ".json" => "JSON",
    ".md" => "Markdown",
    ".rb" => "Ruby",
    ".ts" => "TypeScript",
    ".tsx" => "TypeScript",
    ".yml" => "YAML",
    ".yaml" => "YAML"
  }.freeze

  module_function

  def package_manifests(root = ROOT)
    Dir.glob(File.join(root, "**", "package.json"))
       .reject { |path| ignored_path?(root, path) }
       .filter_map { |path| parse_package_manifest(root, path) }
       .sort_by { |manifest| manifest[:path] }
  end

  def language_inventory(root = ROOT)
    totals = Hash.new { |hash, key| hash[key] = { files: 0, bytes: 0 } }
    total_bytes = 0

    Dir.glob(File.join(root, "**", "*"), File::FNM_DOTMATCH).each do |path|
      next if File.directory?(path)
      next if ignored_path?(root, path)

      language = LANGUAGE_BY_EXTENSION[File.extname(path).downcase]
      next unless language

      bytes = File.size(path)
      totals[language][:files] += 1
      totals[language][:bytes] += bytes
      total_bytes += bytes
    end

    totals.map do |language, values|
      percent = total_bytes.positive? ? (values[:bytes].to_f / total_bytes) * 100 : 0.0
      { language: language, files: values[:files], bytes: values[:bytes], percent: percent.round(2) }
    end.sort_by { |item| [-item[:bytes], item[:language]] }
  end

  def version_alignment(root = ROOT)
    manifests = package_manifests(root)
    versions = manifests.group_by { |manifest| manifest[:version] }
    {
      aligned: versions.keys.compact.size <= 1,
      versions: versions.transform_values { |items| items.map { |item| item[:name] } }
    }
  end

  def runtime_dependency_count(package_name, root = ROOT)
    manifest = package_manifests(root).find { |item| item[:name] == package_name }
    return 0 unless manifest

    manifest.fetch(:dependencies, {}).size
  end

  def parse_package_manifest(root, path)
    content = JSON.parse(File.read(path))
    return nil unless content["name"]

    {
      name: content["name"],
      version: content["version"],
      path: path.delete_prefix("#{root}#{File::SEPARATOR}").tr("\\", "/"),
      dependencies: content.fetch("dependencies", {})
    }
  rescue JSON::ParserError
    nil
  end

  def ignored_path?(root, path)
    relative_parts = path.delete_prefix("#{root}#{File::SEPARATOR}").split(/[\\\/]/)
    (relative_parts & IGNORED_DIRECTORIES).any?
  end
end

#!/usr/bin/env ruby
# frozen_string_literal: true

# Markdown Navigation, Sidebar & Search Index Generator
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'

module Docs
  def self.generate
    puts '⩛ [DOCS GENERATOR] Scanning documentation files...'

    documentation_root = File.expand_path('../../docs', __dir__)
    languages = %w[en id]
    manifest = {}

    languages.each do |language|
      language_directory = File.join(documentation_root, language)
      next unless Dir.exist?(language_directory)

      files = Dir.glob("#{language_directory}/**/*.md").map do |file_path|
        relative_path = file_path.sub("#{language_directory}/", '')
        title = File.basename(file_path, '.md').tr('-', ' ').split.map(&:capitalize).join(' ')
        {
          id: relative_path.sub('.md', ''),
          title: title,
          path: "/#{language}/#{relative_path}"
        }
      end

      manifest[language] = {
        language: language,
        count: files.length,
        sidebar: files
      }
    end

    output_path = File.join(documentation_root, 'manifest.json')
    File.write(output_path, JSON.pretty_generate(manifest))
    puts "✓ Documentation manifest generated at #{output_path}"
  end
end

Docs.generate if __FILE__ == $PROGRAM_NAME

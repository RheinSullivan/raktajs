#!/usr/bin/env ruby
# frozen_string_literal: true

# Markdown Navigation, Sidebar & Search Index Generator
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'

module Docs
  def self.generate
    puts '⩛ [DOCS GENERATOR] Scanning documentation files...'

    docs_root = File.expand_path('../../docs', __dir__)
    languages = %w[en id]
    manifest = {}

    languages.each do |lang|
      lang_dir = File.join(docs_root, lang)
      next unless Dir.exist?(lang_dir)

      files = Dir.glob("#{lang_dir}/**/*.md").map do |file|
        rel_path = file.sub("#{lang_dir}/", '')
        title = File.basename(file, '.md').tr('-', ' ').split.map(&:capitalize).join(' ')
        {
          id: rel_path.sub('.md', ''),
          title: title,
          path: "/#{lang}/#{rel_path}"
        }
      end

      manifest[lang] = {
        language: lang,
        count: files.length,
        sidebar: files
      }
    end

    output_path = File.join(docs_root, 'manifest.json')
    File.write(output_path, JSON.pretty_generate(manifest))
    puts "✓ Documentation manifest generated at #{output_path}"
  end
end

Docs.generate if __FILE__ == $PROGRAM_NAME

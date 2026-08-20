#!/usr/bin/env ruby
# frozen_string_literal: true

# Automated Versioning and Release Management
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'
require 'time'

module Release
  def self.bump(target_version)
    puts "⩛ [RELEASE] Bumping version to #{target_version}..."

    package_paths = [
      File.expand_path('../../package.json', __dir__),
      File.expand_path('../../packages/rakta/package.json', __dir__),
      File.expand_path('../../packages/create-rakta/package.json', __dir__),
      File.expand_path('../../templates/frontendOnly/package.json', __dir__),
      File.expand_path('../../templates/fullstack/frontend/package.json', __dir__)
    ]

    package_paths.each do |manifest_path|
      next unless File.exist?(manifest_path)

      package_manifest = JSON.parse(File.read(manifest_path))
      package_manifest['version'] = target_version if package_manifest['version']
      if package_manifest['dependencies'] && package_manifest['dependencies']['raktajs']
        package_manifest['dependencies']['raktajs'] = "^#{target_version}"
      end
      File.write(manifest_path, JSON.pretty_generate(package_manifest) + "\n")
      puts "  Updated #{File.basename(File.dirname(manifest_path))}/#{File.basename(manifest_path)} -> #{target_version}"
    end

    generator_path = File.expand_path('../../packages/create-rakta/src/generator.ts', __dir__)
    if File.exist?(generator_path)
      content = File.read(generator_path)
      content.gsub!(/raktajs:\s*"\^\d+\.\d+\.\d+"/, "raktajs: \"^#{target_version}\"")
      File.write(generator_path, content)
      puts "  Updated packages/create-rakta/src/generator.ts -> ^#{target_version}"
    end

    changelog_path = File.expand_path('../../CHANGELOG.md', __dir__)
    entry = "\n## [#{target_version}] - #{Time.now.strftime('%Y-%m-%d')}\n- Automated framework core evolution update\n"
    if File.exist?(changelog_path)
      content = File.read(changelog_path)
      File.write(changelog_path, entry + content)
    else
      File.write(changelog_path, "# Changelog\n#{entry}")
    end

    puts '  Updated CHANGELOG.md'
    puts '✓ Release preparation completed successfully!'
  end
end

if __FILE__ == $PROGRAM_NAME
  version = ARGV[0] || '1.1.3'
  Release.bump(version)
end

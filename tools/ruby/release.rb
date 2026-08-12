#!/usr/bin/env ruby
# frozen_string_literal: true

# Automated Versioning and Release Management
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'
require 'time'

module Release
  def self.bump(target_version)
    puts "⩛ [RELEASE] Bumping version to #{target_version}..."

    pkg_paths = [
      File.expand_path('../../package.json', __dir__),
      File.expand_path('../../packages/rakta/package.json', __dir__),
      File.expand_path('../../packages/create-rakta/package.json', __dir__)
    ]

    pkg_paths.each do |path|
      next unless File.exist?(path)

      pkg = JSON.parse(File.read(path))
      pkg['version'] = target_version
      File.write(path, JSON.pretty_generate(pkg) + "\n")
      puts "  Updated #{File.basename(File.dirname(path))}/#{File.basename(path)} -> #{target_version}"
    end

    gen_path = File.expand_path('../../packages/create-rakta/src/generator.ts', __dir__)
    if File.exist?(gen_path)
      content = File.read(gen_path)
      content.gsub!(/raktajs:\s*"\^\d+\.\d+\.\d+"/, "raktajs: \"^#{target_version}\"")
      File.write(gen_path, content)
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

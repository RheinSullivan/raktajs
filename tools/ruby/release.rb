#!/usr/bin/env ruby
# frozen_string_literal: true

# Automated Versioning and Release Management
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'
require 'time'

module Release
  def self.bump(target_version)
    puts "⩛ [RELEASE] Bumping version to #{target_version}..."

    root_pkg_path = File.expand_path('../../package.json', __dir__)
    if File.exist?(root_pkg_path)
      pkg = JSON.parse(File.read(root_pkg_path))
      pkg['version'] = target_version
      File.write(root_pkg_path, JSON.pretty_generate(pkg) + "\n")
      puts "  Updated package.json -> #{target_version}"
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

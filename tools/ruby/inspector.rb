#!/usr/bin/env ruby
# frozen_string_literal: true

# Project Structure & Dependency Graph Inspector
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'

module Inspector
  def self.inspect_dir(target_directory = '.')
    puts "⩛ [INSPECTOR] Inspecting directory #{File.expand_path(target_directory)}..."

    package_path = File.join(target_directory, 'package.json')
    if File.exist?(package_path)
      package_manifest = JSON.parse(File.read(package_path))
      puts "  Name: #{package_manifest['name'] || 'Unnamed'}"
      puts "  Version: #{package_manifest['version'] || '0.0.0'}"
      puts "  Dependencies: #{package_manifest['dependencies']&.keys&.length || 0} packages"
      puts "  DevDependencies: #{package_manifest['devDependencies']&.keys&.length || 0} packages"
    else
      puts "  No package.json found in target directory."
    end

    app_directory = File.join(target_directory, 'app')
    if Dir.exist?(app_directory)
      routes = Dir.glob("#{app_directory}/**/page.tsx").map do |file_path|
        route = file_path.sub("#{app_directory}/", '').sub('/page.tsx', '').sub('page.tsx', '/')
        route.empty? ? '/' : "/#{route}"
      end
      puts "  Discovered Routes (#{routes.length}):"
      routes.each { |route| puts "    - #{route}" }
    end
  end
end

Inspector.inspect_dir(ARGV[0] || '.') if __FILE__ == $PROGRAM_NAME

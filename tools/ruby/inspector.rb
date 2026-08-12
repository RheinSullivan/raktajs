#!/usr/bin/env ruby
# frozen_string_literal: true

# Project Structure & Dependency Graph Inspector
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'

module Inspector
  def self.inspect_dir(target_dir = '.')
    puts "⩛ [INSPECTOR] Inspecting directory #{File.expand_path(target_dir)}..."

    pkg_path = File.join(target_dir, 'package.json')
    if File.exist?(pkg_path)
      pkg = JSON.parse(File.read(pkg_path))
      puts "  Name: #{pkg['name'] || 'Unnamed'}"
      puts "  Version: #{pkg['version'] || '0.0.0'}"
      puts "  Dependencies: #{pkg['dependencies']&.keys&.length || 0} packages"
      puts "  DevDependencies: #{pkg['devDependencies']&.keys&.length || 0} packages"
    else
      puts "  No package.json found in target directory."
    end

    app_dir = File.join(target_dir, 'app')
    if Dir.exist?(app_dir)
      routes = Dir.glob("#{app_dir}/**/page.tsx").map do |f|
        route = f.sub("#{app_dir}/", '').sub('/page.tsx', '').sub('page.tsx', '/')
        route.empty? ? '/' : "/#{route}"
      end
      puts "  Discovered Routes (#{routes.length}):"
      routes.each { |r| puts "    - #{r}" }
    end
  end
end

Inspector.inspect_dir(ARGV[0] || '.') if __FILE__ == $PROGRAM_NAME

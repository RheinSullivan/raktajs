#!/usr/bin/env ruby
# frozen_string_literal: true

# Diagnostic Tool for Development Environment
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'json'
require 'open3'

module Doctor
  VERSION = '1.1.3'

  def self.check_command(command_text)
    stdout, _stderr, status = Open3.capture3("#{command_text} --version")
    if status.success?
      stdout.strip.lines.first
    else
      nil
    end
  rescue StandardError
    nil
  end

  def self.run
    puts "⩛ [DOCTOR v#{VERSION}] Environment Diagnostics"
    puts '=================================================='

    checks = {
      'Bun' => check_command('bun'),
      'Node.js' => check_command('node'),
      'Git' => check_command('git'),
      'Go Engine' => check_command('go'),
      'Ruby Tooling' => "#{RUBY_VERSION} (#{RUBY_PLATFORM})"
    }

    issues = 0

    checks.each do |name, status|
      if status
        puts "  ✔ #{name.ljust(15)} : #{status}"
      else
        puts "  ✖ #{name.ljust(15)} : NOT INSTALLED (Optional / Recommended)"
        issues += 1
      end
    end

    puts '=================================================='
    if issues.zero?
      puts '✓ All core runtime dependencies are in optimal state!'
    else
      puts "ⓘ #{issues} optional dependencies missing. Bun fallback is fully active."
    end
  end
end

Doctor.run if __FILE__ == $PROGRAM_NAME

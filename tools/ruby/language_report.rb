#!/usr/bin/env ruby
# frozen_string_literal: true

require "json"
require_relative "rakta_toolkit"

format = ARGV.include?("--json") ? "json" : "text"
languages = RaktaToolkit.language_inventory

if format == "json"
  puts JSON.pretty_generate({ languages: languages })
else
  puts "Rakta.js Language Inventory"
  puts "=" * 60
  languages.each do |item|
    puts "#{item[:language].ljust(12)} #{item[:files].to_s.rjust(4)} files #{item[:bytes].to_s.rjust(9)} bytes #{format('%6.2f', item[:percent])}%"
  end
end

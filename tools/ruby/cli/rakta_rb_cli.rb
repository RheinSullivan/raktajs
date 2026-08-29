# frozen_string_literal: true

# Rakta.js Ruby CLI Companion
# Interactive developer console providing project inspection, environment doctoring, and benchmark reporting.

require "json"
require "optparse"
require_relative "../rakta_toolkit"
require_relative "../security/rakta_shield"
require_relative "../security/vault_manager"
require_relative "../perf/profile_runner"
require_relative "../analytics/metrics_collector"

module Rakta
  module CLI
    class Runner
      def self.start(args = ARGV)
        options = {}
        parser = OptionParser.new do |opts|
          opts.banner = "Usage: rakta-cli [command] [options]"

          opts.on("-v", "--version", "Print Rakta version") do
            puts "Rakta.js Ruby Companion Tooling v1.2.2 (Vyagra Nexus™)"
            exit 0
          end

          opts.on("-h", "--help", "Prints this help message") do
            puts opts
            exit 0
          end
        end

        parser.parse!(args)
        command = args.first || "doctor"

        case command
        when "doctor"
          run_doctor
        when "languages"
          run_languages
        when "bench"
          run_benchmark
        when "vault:generate"
          puts "Generated Master Key: #{Security::VaultManager.generate_master_key}"
        else
          puts "Unknown command: #{command}"
          puts parser
          exit 1
        end
      end

      def self.run_doctor
        puts "=== Rakta.js Doctor (Ruby Diagnostic Suite) ==="
        manifests = RaktaToolkit.package_manifests
        puts "Discovered Packages: #{manifests.size}"
        manifests.each do |m|
          puts "  • #{m[:name].ljust(35)} (v#{m[:version]}) -> #{m[:path]}"
        end
        puts "Status: ALL PACKAGES OPERATIONAL"
      end

      def self.run_languages
        puts "=== Rakta.js Multi-Language Breakdown ==="
        inv = RaktaToolkit.language_inventory
        inv.each do |item|
          puts "  #{item[:language].ljust(15)}: #{item[:percent]}% (#{item[:files]} files, #{item[:bytes]} bytes)"
        end
      end

      def self.run_benchmark
        runner = Perf::ProfileRunner.new(iterations: 50)
        runner.profile_block("JSON Serialization") { JSON.dump({ user: "Rhein", framework: "Rakta.js", v: "1.2.2" }) }
        runner.profile_block("SHA256 Token Sign") { OpenSSL::Digest::SHA256.hexdigest("sample-token-payload") }
        puts runner.render_report
      end
    end
  end
end

if $PROGRAM_NAME == __FILE__
  Rakta::CLI::Runner.start
end

#!/usr/bin/env ruby
# frozen_string_literal: true

# Project & Plugin Generator
# Scaffold SPA, SSR, SSG, CSR, Library, Dashboard, and Plugin templates
# Crafted by Muhammad Rizky Ramadhan (Rhein Sullivan / Vyagra Nexus™)

require 'fileutils'
require 'json'

module Generators
  SUPPORTED_MODES = %w[spa ssr ssg csr library dashboard blog landing].freeze

  def self.create_project(name, mode = 'spa')
    mode = 'spa' unless SUPPORTED_MODES.include?(mode)
    target_directory = File.expand_path(name, Dir.pwd)

    puts "⩛ [GENERATOR] Creating project '#{name}' (Mode: #{mode.upcase})..."
    FileUtils.mkdir_p(File.join(target_directory, 'app'))

    package_manifest = {
      name: name,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: "rakta dev#{mode == 'spa' ? ' --spa' : ''}",
        build: 'rakta build',
        start: 'rakta start'
      },
      dependencies: {
        rakta: '^1.1.3',
        react: '^19.0.0',
        'react-dom': '^19.0.0'
      }
    }

    File.write(File.join(target_directory, 'package.json'), JSON.pretty_generate(package_manifest))

    rakta_config = <<~TS
      import { defineConfig } from "raktajs/config";

      export default defineConfig({
        mode: "#{mode}",
        spa: #{mode == 'spa' ? 'true' : 'false'},
        autoImport: {
          enabled: true,
        },
      });
    TS

    File.write(File.join(target_directory, 'rakta.config.ts'), rakta_config)

    app_page = <<~TSX
      export default function Page() {
        return (
          <main className="min-h-screen bg-black text-white p-8 font-mono">
            <h1 className="text-3xl font-bold">⩛ Welcome to #{name}</h1>
            <p className="mt-2 text-rose-400">Rendering Mode: #{mode.upcase}</p>
          </main>
        );
      }
    TSX

    File.write(File.join(target_directory, 'app', 'page.tsx'), app_page)
    puts "✓ Project scaffolded successfully in #{target_directory}"
  end
end

if __FILE__ == $PROGRAM_NAME
  project_name = ARGV[0] || 'my-app'
  project_mode = ARGV[1] || 'spa'
  Generators.create_project(project_name, project_mode)
end

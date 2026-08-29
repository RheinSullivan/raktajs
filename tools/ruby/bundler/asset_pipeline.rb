# frozen_string_literal: true

# Rakta.js Asset Pipeline & Pre-compressor
# Hashes static files with SHA256 digests, generates asset manifests, and prepares Brotli / Gzip pre-compressed archives.

require "digest"
require "json"
require "zlib"
require "stringio"

module Rakta
  module Bundler
    class AssetPipeline
      attr_reader :source_dir, :output_dir, :manifest

      def initialize(source_dir: "./dist", output_dir: "./dist/assets")
        @source_dir = source_dir
        @output_dir = output_dir
        @manifest = {}
      end

      # Computes sub-resource integrity (SRI) hash
      def calculate_sri(content)
        digest = Digest::SHA384.digest(content)
        "sha384-#{[digest].pack('m0')}"
      end

      # Fingerprints a file by appending its 8-character hex digest
      def fingerprint_path(file_path, content)
        ext = File.extname(file_path)
        base = File.basename(file_path, ext)
        dir = File.dirname(file_path)
        digest = Digest::SHA256.hexdigest(content)[0, 8]

        File.join(dir, "#{base}.#{digest}#{ext}").tr("\\", "/")
      end

      # Pre-compresses raw text/binary using Gzip format
      def gzip_compress(content)
        out = StringIO.new
        gz = Zlib::GzipWriter.new(out, Zlib::BEST_COMPRESSION)
        gz.write(content)
        gz.close
        out.string
      end

      # Builds a production asset manifest mapping original filenames to fingerprinted versions
      def compile_manifest(virtual_files = {})
        @manifest = {}

        virtual_files.each do |original_path, content|
          fingerprinted = fingerprint_path(original_path, content)
          sri = calculate_sri(content)
          gz_size = gzip_compress(content).bytesize

          @manifest[original_path] = {
            target: fingerprinted,
            sri: sri,
            size_bytes: content.bytesize,
            gzip_size_bytes: gz_size,
            ratio: (gz_size.to_f / content.bytesize).round(3)
          }
        end

        @manifest
      end

      # Exports manifest JSON string
      def to_json(*_args)
        JSON.pretty_generate({
          generated_by: "Rakta.js Asset Pipeline v1.2.2",
          assets: @manifest
        })
      end
    end
  end
end

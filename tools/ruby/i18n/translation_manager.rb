# frozen_string_literal: true

# Rakta.js Internationalization & Localization Manager
# Synchronizes translation keys between English, Indonesian, Arabic, and other locales.
# Detects missing keys, validates interpolation placeholders, and formats language catalogs.

require "json"
require "yaml"

module Rakta
  module I18n
    class TranslationManager
      SUPPORTED_LOCALES = %w[en id ar zh es fr de ja].freeze

      attr_reader :translations, :fallback_locale

      def initialize(fallback_locale: "en")
        @fallback_locale = fallback_locale
        @translations = {}
        SUPPORTED_LOCALES.each { |loc| @translations[loc] = {} }
      end

      # Loads JSON or YAML translation catalog for a locale
      def load_catalog(locale, content_or_path)
        loc = locale.to_s.downcase
        return false unless SUPPORTED_LOCALES.include?(loc)

        data = if content_or_path.is_a?(Hash)
                 content_or_path
               elsif File.exist?(content_or_path.to_s)
                 raw = File.read(content_or_path)
                 content_or_path.end_with?(".yml", ".yaml") ? YAML.safe_load(raw) : JSON.parse(raw)
               else
                 JSON.parse(content_or_path.to_s)
               end

        @translations[loc] = flatten_hash(data)
        true
      rescue StandardError => e
        warn "Failed to load catalog for #{locale}: #{e.message}"
        false
      end

      # Translates a key with parameter interpolation
      def translate(key, locale: @fallback_locale, **params)
        loc = locale.to_s.downcase
        catalog = @translations[loc] || @translations[@fallback_locale] || {}
        template = catalog[key.to_s] || @translations[@fallback_locale]&.[](key.to_s) || key.to_s

        interpolate(template, params)
      end

      alias t translate

      # Audits missing translation keys across all registered locales
      def audit_missing_keys
        base_keys = (@translations[@fallback_locale] || {}).keys
        report = {}

        @translations.each do |loc, dict|
          next if loc == @fallback_locale
          missing = base_keys - dict.keys
          coverage = base_keys.empty? ? 100.0 : (((base_keys.size - missing.size).to_f / base_keys.size) * 100.0).round(1)

          report[loc] = {
            missing_count: missing.size,
            coverage_percent: coverage,
            missing_keys: missing.first(10)
          }
        end

        report
      end

      private

      def flatten_hash(hash, prefix = "")
        result = {}
        hash.each do |k, v|
          full_key = prefix.empty? ? k.to_s : "#{prefix}.#{k}"
          if v.is_a?(Hash)
            result.merge!(flatten_hash(v, full_key))
          else
            result[full_key] = v.to_s
          end
        end
        result
      end

      def interpolate(template, params)
        params.reduce(template.dup) do |acc, (k, v)|
          acc.gsub("{#{k}}", v.to_s).gsub("{{#{k}}}", v.to_s)
        end
      end
    end
  end
end

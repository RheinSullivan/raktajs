# frozen_string_literal: true

# Test specifications for Rakta.js i18n manager and asset bundler

require "minitest/autorun"
require_relative "../i18n/translation_manager"
require_relative "../bundler/asset_pipeline"

class RaktaI18nAndBundlerTest < Minitest::Test
  def test_translation_manager_interpolation
    i18n = Rakta::I18n::TranslationManager.new(fallback_locale: "en")
    i18n.load_catalog("en", { "welcome" => "Welcome to {app}, {user}!", "hero.title" => "Ultra Fast Fullstack Framework" })
    i18n.load_catalog("id", { "welcome" => "Selamat datang di {app}, {user}!", "hero.title" => "Framework Fullstack Super Cepat" })

    en_text = i18n.t("welcome", locale: "en", app: "Rakta.js", user: "Rhein")
    id_text = i18n.t("welcome", locale: "id", app: "Rakta.js", user: "Rhein")

    assert_equal "Welcome to Rakta.js, Rhein!", en_text
    assert_equal "Selamat datang di Rakta.js, Rhein!", id_text
  end

  def test_translation_manager_missing_keys_audit
    i18n = Rakta::I18n::TranslationManager.new(fallback_locale: "en")
    i18n.load_catalog("en", { "a" => "A", "b" => "B", "c" => "C" })
    i18n.load_catalog("id", { "a" => "A", "b" => "B" }) # missing 'c'

    audit = i18n.audit_missing_keys
    assert_equal 1, audit["id"][:missing_count]
    assert_includes audit["id"][:missing_keys], "c"
  end

  def test_asset_pipeline_fingerprinting_and_sri
    pipeline = Rakta::Bundler::AssetPipeline.new
    content = "console.log('Rakta.js Production Bundle');"

    manifest = pipeline.compile_manifest({ "app.js" => content })
    assert manifest["app.js"]
    assert manifest["app.js"][:target].start_with?("app.")
    assert manifest["app.js"][:sri].start_with?("sha384-")
    assert manifest["app.js"][:gzip_size_bytes] > 0
  end
end

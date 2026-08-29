# frozen_string_literal: true

# Test specifications for Rakta.js Ruby adapters and security modules

require "minitest/autorun"
require_relative "../adapters/rails_adapter"
require_relative "../adapters/sinatra_adapter"
require_relative "../adapters/roda_adapter"
require_relative "../adapters/hanami_adapter"
require_relative "../adapters/grape_adapter"
require_relative "../security/rakta_shield"
require_relative "../security/vault_manager"
require_relative "../perf/profile_runner"
require_relative "../analytics/metrics_collector"

class RaktaAdaptersTest < Minitest::Test
  def test_rails_adapter_rpc_dispatch
    adapter = Rakta::Adapters::RailsAdapter.new
    adapter.register_rpc("math.add") do |params|
      (params["a"] || 0) + (params["b"] || 0)
    end

    raw_req = JSON.dump({ "procedure" => "math.add", "params" => { "a" => 10, "b" => 25 } })
    response = adapter.handle_rpc_request(raw_req)

    assert_equal 200, response[:status]
    assert_equal 35, response[:body][:data]
    assert response[:body][:success]
  end

  def test_rails_adapter_rpc_not_found
    adapter = Rakta::Adapters::RailsAdapter.new
    raw_req = JSON.dump({ "procedure" => "nonexistent.proc" })
    response = adapter.handle_rpc_request(raw_req)

    assert_equal 404, response[:status]
    refute response[:body][:success]
  end

  def test_security_shield_cookie_signing
    shield = Rakta::Security::Shield.new(secret_key: "unit-test-secret-key-123")
    data = { "user_id" => "9948", "role" => "admin" }

    signed = shield.sign_cookie(data)
    recovered = shield.verify_cookie(signed)

    assert_equal data, recovered

    # Tampering test
    tampered = "#{signed}bad"
    assert_nil shield.verify_cookie(tampered)
  end

  def test_vault_encryption_and_decryption
    vault = Rakta::Security::VaultManager.new
    secret_text = "production-database-password-sec-4921"

    encrypted = vault.encrypt(secret_text)
    decrypted = vault.decrypt(encrypted)

    assert_equal secret_text, decrypted
  end

  def test_metrics_collector_recording
    collector = Rakta::Analytics::MetricsCollector.new
    collector.record("/api/users", 200, 12.5)
    collector.record("/api/users", 200, 15.0)
    collector.record("/api/orders", 500, 45.0)

    snap = collector.snapshot
    assert_equal 3, snap[:requests_total]
    assert_equal 1, snap[:errors_total]
    assert_equal 33.33, snap[:error_rate_percent]
    assert_equal "DEGRADED", snap[:status]
  end

  def test_profile_runner_statistics
    runner = Rakta::Perf::ProfileRunner.new(iterations: 10)
    res = runner.profile_block("Fast Hash") { { a: 1, b: 2 } }

    assert_equal "Fast Hash", res[:name]
    assert res[:stats][:avg_ms] >= 0
  end
end

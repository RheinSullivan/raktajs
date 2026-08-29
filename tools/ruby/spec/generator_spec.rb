# frozen_string_literal: true

# Test specifications for Rakta.js Ruby generators and benchmark harnesses

require "minitest/autorun"
require_relative "../generators/component_generator"
require_relative "../generators/route_generator"
require_relative "../benchmark/http_benchmark"
require_relative "../telemetry/statsd_client"

class RaktaGeneratorsAndBenchTest < Minitest::Test
  def test_component_generator_output
    gen = Rakta::Generators::ComponentGenerator.new(name: "UserProfileCard", category: "cards")
    code = gen.generate_component_code

    assert_includes code, "export default function UserProfileCard"
    assert_includes code, "UserProfileCardProps"
    assert_includes code, "FaCircleCheck"
    assert_includes code, "gsap.fromTo"
  end

  def test_component_test_generator
    gen = Rakta::Generators::ComponentGenerator.new(name: "Button")
    test_code = gen.generate_test_code

    assert_includes test_code, 'describe("Button Component"'
    assert_includes test_code, 'import Button from "./Button"'
  end

  def test_route_generator_page_and_layout
    gen = Rakta::Generators::RouteGenerator.new(route_path: "/dashboard/settings")
    page_code = gen.generate_page_code
    layout_code = gen.generate_layout_code

    assert_includes page_code, "SettingsPage"
    assert_includes page_code, "Route: /dashboard/settings"
    assert_includes layout_code, "Layout({ children }"
  end

  def test_statsd_client_metric_formatting
    client = Rakta::Telemetry::StatsDClient.new(namespace: "rakta_test")
    # Metric emission without exceptions
    client.increment("users.login", tags: ["env:test"])
    client.gauge("memory.usage", 256.4)
    client.timing("render.latency", 12.3)

    assert_equal "rakta_test", client.namespace
    client.close
  end
end

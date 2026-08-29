# frozen_string_literal: true

# Rakta.js Hanami 2 Adapter
# Bridges Rakta.js frontend applications with Hanami 2 slice architecture.
# Encapsulates clean action dispatching, contract validation, and response mapping.

require "json"

module Rakta
  module Adapters
    class HanamiAdapter
      attr_reader :slice_name, :api_base

      def initialize(slice_name: "main", api_base: "/api")
        @slice_name = slice_name
        @api_base = api_base
        @registered_actions = {}
      end

      # Registers a slice action callable through Rakta RPC
      def register_action(name, contract: nil, &handler)
        @registered_actions[name.to_s] = {
          handler: handler,
          contract: contract
        }
      end

      # Dispatches an inbound Rakta request through the Hanami action pipeline
      def dispatch(env)
        request = Rack::Request.new(env)
        return handle_cors_preflight if request.options?

        body = request.body.read
        request.body.rewind

        params = body.empty? ? {} : (JSON.parse(body) rescue {})
        procedure = params["procedure"] || env["PATH_INFO"].delete_prefix(@api_base).delete_prefix("/")

        action_def = @registered_actions[procedure]
        return not_found_response(procedure) unless action_def

        # Optional Contract validation simulation
        if action_def[:contract] && action_def[:contract].respond_to?(:call)
          validation = action_def[:contract].call(params["params"] || {})
          if validation.respond_to?(:failure?) && validation.failure?
            return [422, { "Content-Type" => "application/json" }, [JSON.dump({ success: false, errors: validation.errors.to_h })]]
          end
        end

        result = action_def[:handler].call(params["params"] || {}, request)
        [200, { "Content-Type" => "application/json" }, [JSON.dump({ success: true, data: result, framework: "Rakta.js", slice: @slice_name })]]
      rescue StandardError => e
        [500, { "Content-Type" => "application/json" }, [JSON.dump({ success: false, error: e.message })]]
      end

      private

      def handle_cors_preflight
        [
          204,
          {
            "Access-Control-Allow-Origin" => "*",
            "Access-Control-Allow-Methods" => "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers" => "Content-Type, Authorization, X-Rakta-CSRF-Token"
          },
          []
        ]
      end

      def not_found_response(procedure)
        [
          404,
          { "Content-Type" => "application/json" },
          [JSON.dump({ success: false, error: "Hanami action '#{procedure}' not registered in slice '#{@slice_name}'" })]
        ]
      end
    end
  end
end

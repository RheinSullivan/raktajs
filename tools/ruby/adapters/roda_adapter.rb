# frozen_string_literal: true

# Rakta.js Roda Adapter
# High-throughput routing tree adapter for Rakta.js applications with minimum latency overhead.

require "json"

module Rakta
  module Adapters
    class RodaAdapter
      attr_reader :app_name, :static_root

      def initialize(app_name: "rakta-roda-app", static_root: "./dist")
        @app_name = app_name
        @static_root = static_root
      end

      # Generates a production-ready Roda application
      def generate_roda_tree
        <<~RUBY
          # frozen_string_literal: true
          require "roda"
          require "json"

          class RaktaApp < Roda
            plugin :json
            plugin :all_verbs
            plugin :public, root: File.expand_path("#{@static_root}", __dir__)

            route do |r|
              r.public

              r.on "api" do
                r.on "rakta" do
                  r.post "rpc" do
                    body = r.body.read
                    data = JSON.parse(body) rescue {}
                    procedure = data["procedure"]

                    {
                      success: true,
                      procedure: procedure,
                      framework: "Rakta.js",
                      engine: "Roda Tree Routing",
                      processed_at: Time.now.to_i
                    }
                  end

                  r.get "ping" do
                    { pong: true, time: Time.now.utc.iso8601 }
                  end
                end
              end

              # SPA Catch-all
              r.root do
                File.read(File.join(File.expand_path("#{@static_root}", __dir__), "index.html"))
              end
            end
          end
        RUBY
      end
    end
  end
end

# frozen_string_literal: true

# Rakta.js Sinatra & Hanami Adapter
# Lightweight, ultra-fast microservice bridge connecting Rakta.js frontend with Sinatra backends.
# Provides automatic CORS management, JSON parameter parsing, and static SPA serving.

require "json"

module Rakta
  module Adapters
    class SinatraAdapter
      attr_reader :public_dir, :cors_origins

      def initialize(public_dir: "./dist", cors_origins: ["*"])
        @public_dir = public_dir
        @cors_origins = cors_origins
      end

      # Generates a complete standalone Sinatra app file wired for Rakta.js
      def generate_app_code
        <<~RUBY
          # frozen_string_literal: true
          require "sinatra"
          require "json"

          set :public_folder, File.expand_path("#{@public_dir}", __dir__)
          set :port, 4000
          set :bind, "0.0.0.0"

          before do
            content_type :json
            headers "Access-Control-Allow-Origin" => "#{@cors_origins.join(',')}",
                    "Access-Control-Allow-Methods" => "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers" => "Content-Type, Authorization, X-Rakta-CSRF-Token"
          end

          options "*" do
            status 200
            ""
          end

          # Rakta RPC multiplexer
          post "/api/rakta/rpc" do
            request.body.rewind
            payload = JSON.parse(request.body.read)
            procedure = payload["procedure"]
            params = payload["params"] || {}

            case procedure
            when "health.check"
              { status: "OPERATIONAL", framework: "Rakta.js", runtime: "Sinatra" }.to_json
            when "user.session"
              { authenticated: true, user: { id: "1", name: "Rhein Sullivan" } }.to_json
            else
              status 404
              { error: "Unknown procedure: \#{procedure}" }.to_json
            end
          end

          # SPA fallback handler
          get "/*" do
            content_type :html
            index_path = File.join(settings.public_folder, "index.html")
            if File.exist?(index_path)
              File.read(index_path)
            else
              status 404
              "<h1>Rakta.js production build not found in \#{settings.public_folder}</h1>"
            end
          end
        RUBY
      end
    end
  end
end

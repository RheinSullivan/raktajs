# frozen_string_literal: true

# Rakta.js Grape API Adapter
# Connects Rakta.js type-safe frontend with Grape RESTful micro-framework endpoints.

require "json"

module Rakta
  module Adapters
    class GrapeAdapter
      attr_reader :version, :prefix

      def initialize(version: "v1", prefix: "api")
        @version = version
        @prefix = prefix
      end

      # Generates a standard Grape API class configured for Rakta.js clients
      def generate_api_class(resource_name = "Users")
        <<~RUBY
          # frozen_string_literal: true
          require "grape"

          module RaktaAPI
            class #{resource_name}API < Grape::API
              version "#{@version}", using: :path
              format :json
              prefix "#{@prefix}"

              helpers do
                def authenticate_rakta_user!
                  token = headers["Authorization"]&.split(" ")&.last
                  error!({ error: "Unauthorized" }, 401) unless token == "rakta-valid-session"
                end
              end

              resource :#{resource_name.downcase} do
                desc "List all #{resource_name.downcase}"
                get do
                  {
                    success: true,
                    resource: "#{resource_name}",
                    framework: "Rakta.js",
                    items: [
                      { id: "1", name: "Rhein Sullivan", role: "Super Admin" },
                      { id: "2", name: "Vyagra Nexus", role: "Core Maintainer" }
                    ]
                  }
                end

                desc "Get specific record by ID"
                params do
                  requires :id, type: String, desc: "Record ID"
                end
                get ":id" do
                  {
                    success: true,
                    id: params[:id],
                    name: "Record \#{params[:id]}",
                    framework: "Rakta.js"
                  }
                end
              end
            end
          end
        RUBY
      end
    end
  end
end

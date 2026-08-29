# frozen_string_literal: true

# Rakta.js Kamal Deployment Generator
# Generates zero-downtime Kamal 2 configuration files and Docker compose setups for Rakta.js applications.

module Rakta
  module Deploy
    class KamalGenerator
      attr_reader :app_name, :image_name, :servers

      def initialize(app_name: "rakta-production-app", image_name: "username/rakta-app", servers: ["192.168.0.1"])
        @app_name = app_name
        @image_name = image_name
        @servers = servers
      end

      # Generates standard config/deploy.yml for Kamal
      def generate_kamal_config
        <<~YAML
          # Name of your application. Used to uniquely configure containers.
          service: #{@app_name}

          # Name of the container image.
          image: #{@image_name}

          # Deploy to these servers.
          servers:
            web:
              hosts:
                #{@servers.map { |s| "- #{s}" }.join("\n      ")}
              labels:
                traefik.http.routers.#{@app_name}.rule: PathPrefix(`/`)
                traefik.http.routers.#{@app_name}.entrypoints: websecure
                traefik.http.routers.#{@app_name}.tls.certresolver: letsencrypt

          # Credentials for your image host registry.
          registry:
            username:
              - DOCKER_REGISTRY_USER
            password:
              - DOCKER_REGISTRY_PASSWORD

          # Inject environment variables into containers.
          env:
            clear:
              RAKTA_ENV: production
              PORT: 3000
            secret:
              - RAKTA_SECRET_KEY
              - DATABASE_URL

          # Healthcheck configuration to ensure zero-downtime rolling deploys.
          healthcheck:
            path: /api/health
            port: 3000
            max_attempts: 10
            interval: 3s
        YAML
      end
    end
  end
end

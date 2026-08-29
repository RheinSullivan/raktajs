# frozen_string_literal: true

# Rakta.js Chunk Optimizer Tool
# Groups dynamic imports, suggests code splitting boundaries, and calculates bundle savings.

require "json"

module Rakta
  module Bundler
    class ChunkOptimizer
      attr_reader :routes, :shared_modules

      def initialize(routes: [], shared_modules: [])
        @routes = routes
        @shared_modules = shared_modules
      end

      # Identifies duplicate modules that should be hoisted to common vendor chunks
      def optimize_chunks(route_dependency_map = {})
        module_usage = Hash.new { |h, k| h[k] = [] }

        route_dependency_map.each do |route, deps|
          deps.each do |mod|
            module_usage[mod] << route
          end
        end

        shared_candidates = []
        route_isolated = []

        module_usage.each do |mod, used_by|
          if used_by.size >= 2
            shared_candidates << { module: mod, shared_across: used_by.size, routes: used_by }
          else
            route_isolated << { module: mod, route: used_by.first }
          end
        end

        {
          common_vendor_chunks: shared_candidates.sort_by { |c| -c[:shared_across] },
          isolated_route_chunks: route_isolated,
          suggested_split_count: shared_candidates.size
        }
      end
    end
  end
end

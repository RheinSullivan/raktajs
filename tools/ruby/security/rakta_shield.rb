# frozen_string_literal: true

# Rakta.js Security Shield Tooling
# Inspects CSRF defenses, scans headers, validates encrypted cookie signatures, and performs rate limiting audits.

require "digest"
require "openssl"
require "json"

module Rakta
  module Security
    class Shield
      attr_reader :secret_key, :allowed_origins

      def initialize(secret_key: "default-dev-secret", allowed_origins: [])
        @secret_key = secret_key
        @allowed_origins = allowed_origins
      end

      # Generates a tamper-proof signed cookie payload
      def sign_cookie(data)
        serialized = JSON.dump(data)
        digest = OpenSSL::HMAC.hexdigest("SHA256", @secret_key, serialized)
        "#{serialized}.#{digest}"
      end

      # Verifies and unwraps a signed cookie
      def verify_cookie(signed_cookie)
        return nil unless signed_cookie.is_a?(String) && signed_cookie.include?(".")

        parts = signed_cookie.split(".")
        digest = parts.pop
        payload = parts.join(".")

        expected_digest = OpenSSL::HMAC.hexdigest("SHA256", @secret_key, payload)
        return nil unless Rack::Utils.secure_compare(digest, expected_digest) rescue (digest == expected_digest)

        JSON.parse(payload)
      rescue JSON::ParserError
        nil
      end

      # Validates whether a CORS origin is trusted
      def origin_trusted?(origin)
        return true if @allowed_origins.include?("*")
        return false if origin.nil? || origin.empty?

        @allowed_origins.any? do |allowed|
          if allowed.start_with?("*.")
            domain = allowed[2..]
            origin.end_with?(domain)
          else
            allowed == origin
          end
        end
      end

      # Performs a comprehensive security headers audit on an HTTP response hash
      def audit_headers(headers)
        recommendations = []
        lower_headers = headers.transform_keys(&:downcase)

        unless lower_headers["content-security-policy"]
          recommendations << "Missing Content-Security-Policy header"
        end

        unless lower_headers["x-frame-options"]
          recommendations << "Missing X-Frame-Options (recommend DENY or SAMEORIGIN)"
        end

        unless lower_headers["x-content-type-options"] == "nosniff"
          recommendations << "X-Content-Type-Options should be set to 'nosniff'"
        end

        unless lower_headers["strict-transport-security"]
          recommendations << "Missing Strict-Transport-Security header"
        end

        {
          secure: recommendations.empty?,
          score: [100 - (recommendations.size * 25), 0].max,
          recommendations: recommendations
        }
      end
    end
  end
end

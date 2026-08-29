# frozen_string_literal: true

# Rakta.js Secrets Vault Manager
# Encrypts environment credentials, rotates master keys, and manages production secrets.

require "openssl"
require "base64"
require "json"

module Rakta
  module Security
    class VaultManager
      CIPHER_TYPE = "aes-256-gcm"

      attr_reader :master_key

      def initialize(master_key: nil)
        @master_key = master_key || derive_key(ENV["RAKTA_MASTER_KEY"] || "default-rakta-insecure-dev-key-32b!")
      end

      # Encrypts a plaintext secret string or hash
      def encrypt(plaintext)
        data = plaintext.is_a?(String) ? plaintext : JSON.dump(plaintext)
        cipher = OpenSSL::Cipher.new(CIPHER_TYPE)
        cipher.encrypt
        cipher.key = @master_key

        iv = cipher.random_iv
        cipher.auth_data = "RaktaVaultAuth"

        encrypted = cipher.update(data) + cipher.final
        tag = cipher.auth_tag

        {
          iv: Base64.strict_encode64(iv),
          tag: Base64.strict_encode64(tag),
          ciphertext: Base64.strict_encode64(encrypted),
          version: "1.2.2"
        }
      end

      # Decrypts an encrypted vault payload back into plaintext
      def decrypt(payload)
        iv = Base64.strict_decode64(payload[:iv] || payload["iv"])
        tag = Base64.strict_decode64(payload[:tag] || payload["tag"])
        ciphertext = Base64.strict_decode64(payload[:ciphertext] || payload["ciphertext"])

        decipher = OpenSSL::Cipher.new(CIPHER_TYPE)
        decipher.decrypt
        decipher.key = @master_key
        decipher.iv = iv
        decipher.auth_tag = tag
        decipher.auth_data = "RaktaVaultAuth"

        decipher.update(ciphertext) + decipher.final
      rescue OpenSSL::Cipher::CipherError => e
        raise SecurityError, "Vault decryption failed: authentication tag mismatch or invalid master key (#{e.message})"
      end

      # Generates a brand new 256-bit cryptographically secure master key
      def self.generate_master_key
        OpenSSL::Random.random_bytes(32).unpack1("H*")
      end

      private

      def derive_key(raw_secret)
        OpenSSL::Digest::SHA256.digest(raw_secret.to_s)
      end
    end
  end
end

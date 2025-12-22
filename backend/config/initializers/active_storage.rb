# frozen_string_literal: true

# ActiveStorage URL configuration
Rails.application.config.to_prepare do
  ActiveStorage::Current.url_options = {
    host: Rails.application.routes.default_url_options[:host] || "localhost",
    port: Rails.application.routes.default_url_options[:port] || 3000,
    protocol: "http"
  }
end

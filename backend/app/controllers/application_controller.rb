class ApplicationController < ActionController::API
  before_action :set_active_storage_url_options

  private

  def set_active_storage_url_options
    ActiveStorage::Current.url_options = {
      host: Rails.application.routes.default_url_options[:host] || 'localhost',
      port: Rails.application.routes.default_url_options[:port] || 3000,
      protocol: 'http'
    }
  end
end

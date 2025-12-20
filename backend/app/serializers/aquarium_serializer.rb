# frozen_string_literal: true

class AquariumSerializer
  include Rails.application.routes.url_helpers

  def initialize(aquarium, current_user: nil, visited_ids: nil, wishlist_ids: nil)
    @aquarium = aquarium
    @current_user = current_user
    @visited_ids = visited_ids
    @wishlist_ids = wishlist_ids
  end

def as_index_json
  {
    id: @aquarium.id,
    name: @aquarium.name,
    address: @aquarium.address,
    prefecture: @aquarium.prefecture,
    latitude: @aquarium.latitude,
    longitude: @aquarium.longitude,
    average_rating: @aquarium.average_rating,
    visit_count: @aquarium.visit_count,
    visited: visited?,
    in_wishlist: in_wishlist?,
    photo_urls: photo_urls.take(3),
    photos: photos_json(limit: 3),
    latest_photo_url: latest_photo_url
  }
end

def as_detail_json
  {
    id: @aquarium.id,
    name: @aquarium.name,
    description: @aquarium.description,
    address: @aquarium.address,
    prefecture: @aquarium.prefecture,
    latitude: @aquarium.latitude,
    longitude: @aquarium.longitude,
    phone_number: @aquarium.phone_number,
    website: @aquarium.website,
    opening_hours: @aquarium.opening_hours,
    admission_fee: @aquarium.admission_fee,
    average_rating: @aquarium.average_rating,
    visit_count: @aquarium.visit_count,
    visited: visited?,
    in_wishlist: in_wishlist?,
    created_by: @aquarium.user_id,
    photo_urls: photo_urls,
    photos: photos_json,
    recent_visits: recent_visits_json
  }
end


  private

  def visited?
    return false unless @current_user
    return @visited_ids.include?(@aquarium.id) if @visited_ids

    @current_user.visited_aquariums.exists?(@aquarium.id)
  end

  def in_wishlist?
    return false unless @current_user
    return @wishlist_ids.include?(@aquarium.id) if @wishlist_ids

    @current_user.wishlist_aquariums.exists?(@aquarium.id)
  end

  def photo_urls
    return [] unless @aquarium.photos.attached?

    @aquarium.photos.map do |photo|
      rails_blob_url(photo, host: default_url_options[:host], port: default_url_options[:port], protocol: 'http')
    end
  end

  def photos_json(limit: nil)
    return [] unless @aquarium.photos.attached?

    rel = @aquarium.photos.attachments.includes(:blob).order(created_at: :asc)
    rel = rel.limit(limit) if limit

    rel.map do |attachment|
      {
        id: attachment.id,
        url: rails_blob_url(attachment, host: default_url_options[:host], port: default_url_options[:port], protocol: 'http')
      }
    end
  end

  def latest_photo_url
    visit = @aquarium.visits.joins(:photos_attachments).order(visited_at: :desc).first
    return nil unless visit&.photos&.attached?

    rails_blob_url(visit.photos.first, host: default_url_options[:host], port: default_url_options[:port], protocol: 'http')
  rescue StandardError
    nil
  end

  def default_url_options
    Rails.application.routes.default_url_options
  end

  def recent_visits_json
    @aquarium.visits.recent.limit(5).map do |v|
      VisitSerializer.new(v).as_summary_json
    end
  end
end

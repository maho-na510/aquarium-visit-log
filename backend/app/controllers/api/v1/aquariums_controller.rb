# frozen_string_literal: true

class Api::V1::AquariumsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show, :search, :nearby, :og_image]

  before_action :set_aquarium, only: [:show, :update, :destroy, :upload_photos, :destroy_photo, :og_image]
  before_action :require_admin!, only: [:create, :update, :destroy, :upload_photos, :destroy_photo]


  # GET /api/v1/aquariums
  def index
    aquariums = Aquarium.includes(:visits)

    aquariums = aquariums.where(prefecture: params[:prefecture]) if params[:prefecture].present?
    aquariums = apply_visited_filter(aquariums)
    aquariums = apply_sort(aquariums)
    aquariums = aquariums.page(params[:page]).per(params[:per] || 20)

    visited_ids, wishlist_ids = user_relation_ids

    render json: {
      aquariums: aquariums.map { |a|
        ::AquariumSerializer.new(a, current_user: current_user_or_nil, visited_ids: visited_ids, wishlist_ids: wishlist_ids).as_index_json
      },
      pagination: pagination_dict(aquariums)
    }
  end

  # GET /api/v1/aquariums/:id
  def show
    visited_ids, wishlist_ids = user_relation_ids
    render json: ::AquariumSerializer.new(@aquarium, current_user: current_user_or_nil, visited_ids: visited_ids, wishlist_ids: wishlist_ids).as_detail_json
  end
  # GET /api/v1/aquariums/:id/og_image
  def og_image
    url = @aquarium.website
    return render json: { ogImageUrl: nil } if url.blank?

    og = OgImageFetcher.call(url)
    render json: { ogImageUrl: og }
  rescue => e
    Rails.logger.warn("[og_image] #{e.class}: #{e.message}")
    render json: { ogImageUrl: nil }
  end

  # POST /api/v1/aquariums
  def create
    aquarium = Aquarium.new(aquarium_params)
    aquarium.user_id = current_user.id

    if aquarium.save
      render json: ::AquariumSerializer.new(aquarium, current_user: current_user).as_detail_json, status: :created
    else
      render json: { errors: aquarium.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/aquariums/:id
  def update
    if @aquarium.update(aquarium_params)
      render json: ::AquariumSerializer.new(@aquarium, current_user: current_user).as_detail_json
    else
      render json: { errors: @aquarium.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/aquariums/:id
  def destroy
    @aquarium.destroy
    head :no_content
  end

  # GET /api/v1/aquariums/search
  def search
    query = params[:q]
    return render json: { aquariums: [], pagination: nil } if query.blank?

    aquariums = Aquarium.where('name LIKE ? OR address LIKE ?', "%#{query}%", "%#{query}%")

    aquariums = aquariums.page(params[:page]).per(params[:per] || 20)

    visited_ids, wishlist_ids = user_relation_ids

    render json: {
      aquariums: aquariums.map { |a|
        ::AquariumSerializer.new(a, current_user: current_user_or_nil, visited_ids: visited_ids, wishlist_ids: wishlist_ids).as_index_json
      },
      pagination: pagination_dict(aquariums)
    }
  end

  # GET /api/v1/aquariums/nearby
  def nearby
    lat = params[:lat]
    lng = params[:lng]
    distance = params[:distance] || 50

    return render json: { error: '位置情報が必要です' }, status: :bad_request if lat.blank? || lng.blank?

    aquariums = Aquarium.near([lat, lng], distance)

    visited_ids, wishlist_ids = user_relation_ids

    render json: {
      aquariums: aquariums.map { |a|
       ::AquariumSerializer.new(a, current_user: current_user_or_nil, visited_ids: visited_ids, wishlist_ids: wishlist_ids).as_index_json
      }
    }
  end

  # POST /api/v1/aquariums/:id/upload_photos
  def upload_photos
    if params[:photos].blank?
      return render json: { error: "photos が必要です" }, status: :bad_request
    end

    params[:photos].each do |photo|
      @aquarium.photos.attach(photo)
    end

    visited_ids, wishlist_ids = user_relation_ids
    render json: ::AquariumSerializer.new(
      @aquarium,
      current_user: current_user_or_nil,
      visited_ids: visited_ids,
      wishlist_ids: wishlist_ids
    ).as_detail_json
  end

  # DELETE /api/v1/aquariums/:id/photos/:photo_id
  def destroy_photo
    attachment = @aquarium.photos.attachments.find_by(id: params[:photo_id])
    return render json: { error: "写真が見つかりません" }, status: :not_found unless attachment

    attachment.purge

    visited_ids, wishlist_ids = user_relation_ids
    render json: ::AquariumSerializer.new(
      @aquarium,
      current_user: current_user_or_nil,
      visited_ids: visited_ids,
      wishlist_ids: wishlist_ids
    ).as_detail_json
  end


  private

  def set_aquarium
    @aquarium = Aquarium.find(params[:id])
  end

  def aquarium_params
    params.require(:aquarium).permit(
      :name, :description, :address, :latitude, :longitude,
      :phone_number, :website, :prefecture,
      opening_hours: {},
      admission_fee: {},
      photos: []
    )
  end

  def current_user_or_nil
    user_signed_in? ? current_user : nil
  end

  def user_relation_ids
    return [nil, nil] unless user_signed_in?

    visited_ids = current_user.visited_aquariums.pluck(:id)
    wishlist_ids = current_user.wishlist_aquariums.pluck(:id)
    [visited_ids, wishlist_ids]
  end

  def apply_visited_filter(scope)
    return scope unless user_signed_in?
    return scope unless params[:visited].present?

    visited_ids = current_user.visited_aquariums.pluck(:id)
    params[:visited] == 'true' ? scope.where(id: visited_ids) : scope.where.not(id: visited_ids)
  end

  def apply_sort(scope)
    case params[:sort]
    when 'rating'
      scope.left_joins(:visits)
           .group('aquariums.id')
           .order(Arel.sql('AVG(visits.rating) DESC NULLS LAST'))
    when 'visits'
      scope.left_joins(:visits)
           .group('aquariums.id')
           .order(Arel.sql('COUNT(visits.id) DESC'))
    when 'distance'
      if params[:lat].present? && params[:lng].present?
        scope.near([params[:lat], params[:lng]], params[:distance] || 50)
      else
        scope.order(created_at: :desc)
      end
    else
      scope.order(created_at: :desc)
    end
  end
end

# frozen_string_literal: true

class Api::V1::VisitsController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_visit, only: %i[show update destroy upload_photos]
  before_action :authorize_visit!, only: %i[show update destroy upload_photos]

  # GET /api/v1/visits
  def index
    visits = current_user.visits.includes(:aquarium, photos_attachments: :blob, videos_attachments: :blob)

    # 水族館でフィルター
    visits = visits.where(aquarium_id: params[:aquarium_id]) if params[:aquarium_id].present?

    # 期間でフィルター
    if params[:year].present?
      year = params[:year].to_i
      if params[:month].present?
        month = params[:month].to_i
        visits = visits.by_month(year, month)
      else
        visits = visits.by_year(year)
      end
    end

    # 検索（q）: memo や good_exhibits_list を軽く対象に（必要なら調整してOK）
    if params[:q].present?
      q = params[:q].to_s.strip
      if q.present?
        visits = visits.where("memo ILIKE ?", "%#{q}%") if Visit.connection.adapter_name.downcase.include?("postgre")
        visits = visits.where("memo LIKE ?", "%#{q}%") unless Visit.connection.adapter_name.downcase.include?("postgre")
      end
    end

    # ソート
    case params[:sort]
    when "rating"
      visits = visits.order(rating: :desc, visited_at: :desc)
    else # "date" or nil
      visits = visits.order(visited_at: :desc, id: :desc)
    end

    # ページネーション（kaminari想定）
    visits = visits.page(params[:page]).per(params[:per] || 20)

    render json: {
      visits: serialize_visits(visits),
      pagination: pagination_dict(visits)
    }
  end

  # GET /api/v1/visits/:id
  def show
    render json: serialize_visit_detail(@visit)
  end

  # POST /api/v1/visits
  def create
    visit = current_user.visits.build(visit_params)

    if visit.save
      attach_media(visit)
      render json: serialize_visit_detail(visit), status: :created
    else
      render json: { errors: visit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/visits/:id
  def update
    if @visit.update(visit_params)
      attach_media(@visit)
      render json: serialize_visit_detail(@visit)
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/visits/:id
  def destroy
    @visit.destroy
    head :no_content
  end

  # POST /api/v1/visits/:id/upload_photos
  def upload_photos
    attach_media(@visit)
    render json: serialize_visit_detail(@visit)
  end

  private

  def set_visit
    @visit = Visit.includes(:aquarium, :user, photos_attachments: :blob, videos_attachments: :blob).find(params[:id])
  end

  def authorize_visit!
    return if @visit.user_id == current_user.id

    render json: { error: "権限がありません" }, status: :forbidden
  end

  def visit_params
    # フロントが { aquariumId, visitedAt, ... } みたいに送るなら変換が必要。
    # いまの想定は Rails 側は { visit: { ... } } で来る形。
    params.require(:visit).permit(
      :aquarium_id,
      :visited_at,
      :weather,
      :memo,
      :rating,
      good_exhibits_list: []
    )
  end

  def attach_media(visit)
    if params[:photos].present?
      params[:photos].each do |photo|
        break if visit.photos.count >= 10
        visit.photos.attach(photo)
      end
    end

    if params[:videos].present?
      params[:videos].each do |video|
        break if visit.videos.count >= 3
        visit.videos.attach(video)
      end
    end
  end

  def serialize_visits(visits)
    visits.map do |visit|
      {
        id: visit.id,
        aquarium: {
          id: visit.aquarium.id,
          name: visit.aquarium.name,
          address: visit.aquarium.address
        },
        visitedAt: visit.visited_at,
        weather: visit.weather,
        rating: visit.rating,
        memo: visit.memo&.truncate(100),
        photoUrls: visit.photos.limit(3).map { |p| url_for(p) },
        photoCount: visit.photos.count,
        videoCount: visit.videos.count,
        createdAt: visit.created_at,
        updatedAt: visit.updated_at
      }
    end
  end

  def serialize_visit_detail(visit)
    {
      id: visit.id,
      aquarium: {
        id: visit.aquarium.id,
        name: visit.aquarium.name,
        address: visit.aquarium.address,
        latitude: visit.aquarium.latitude,
        longitude: visit.aquarium.longitude
      },
      user: {
        id: visit.user.id,
        name: visit.user.name,
        username: visit.user.username,
        avatarUrl: visit.user.avatar.attached? ? url_for(visit.user.avatar) : nil
      },
      visitedAt: visit.visited_at,
      weather: visit.weather,
      rating: visit.rating,
      memo: visit.memo,
      goodExhibits: visit.good_exhibits_list,
      photoUrls: visit.photos.map { |p| url_for(p) },
      videoUrls: visit.videos.map { |v| url_for(v) },
      createdAt: visit.created_at,
      updatedAt: visit.updated_at
    }
  end
end

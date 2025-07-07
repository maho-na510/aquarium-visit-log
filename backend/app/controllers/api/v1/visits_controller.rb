class Api::V1::VisitsController < Api::V1::BaseController
  before_action :set_visit, only: [:show, :update, :destroy, :upload_photos]
  
  # GET /api/v1/visits
  def index
    @visits = Visit.includes(:aquarium, :user, photos_attachments: :blob)
    
    # ユーザーでフィルター
    @visits = @visits.where(user_id: params[:user_id]) if params[:user_id].present?
    
    # 水族館でフィルター
    @visits = @visits.where(aquarium_id: params[:aquarium_id]) if params[:aquarium_id].present?
    
    # 期間でフィルター
    if params[:year].present?
      if params[:month].present?
        @visits = @visits.by_month(params[:year].to_i, params[:month].to_i)
      else
        @visits = @visits.by_year(params[:year].to_i)
      end
    end
    
    # ソート（デフォルトは新しい順）
    @visits = @visits.recent
    
    # ページネーション
    @visits = @visits.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      visits: serialize_visits(@visits),
      pagination: pagination_dict(@visits)
    }
  end
  
  # GET /api/v1/visits/:id
  def show
    render json: serialize_visit_detail(@visit)
  end
  
  # POST /api/v1/visits
  def create
    @visit = current_user.visits.build(visit_params)
    
    if @visit.save
      attach_media if params[:photos].present? || params[:videos].present?
      render json: serialize_visit_detail(@visit), status: :created
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /api/v1/visits/:id
  def update
    if @visit.user_id != current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    if @visit.update(visit_params)
      attach_media if params[:photos].present? || params[:videos].present?
      render json: serialize_visit_detail(@visit)
    else
      render json: { errors: @visit.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/visits/:id
  def destroy
    if @visit.user_id != current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    @visit.destroy
    head :no_content
  end
  
  # POST /api/v1/visits/:id/upload_photos
  def upload_photos
    if @visit.user_id != current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    attach_media
    render json: serialize_visit_detail(@visit)
  end
  
  private
  
  def set_visit
    @visit = Visit.find(params[:id])
  end
  
  def visit_params
    params.require(:visit).permit(:aquarium_id, :visited_at, :weather, :memo, :rating, good_exhibits_list: [])
  end
  
  def attach_media
    if params[:photos].present?
      params[:photos].each do |photo|
        @visit.photos.attach(photo) if @visit.photos.count < 10
      end
    end
    
    if params[:videos].present?
      params[:videos].each do |video|
        @visit.videos.attach(video) if @visit.videos.count < 3
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
        user: {
          id: visit.user.id,
          name: visit.user.name,
          username: visit.user.username
        },
        visited_at: visit.visited_at,
        weather: visit.weather,
        rating: visit.rating,
        memo: visit.memo&.truncate(100),
        photo_urls: visit.photos.limit(3).map { |p| url_for(p) },
        photo_count: visit.photos.count,
        video_count: visit.videos.count
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
        avatar_url: visit.user.avatar.attached? ? url_for(visit.user.avatar) : nil
      },
      visited_at: visit.visited_at,
      weather: visit.weather,
      rating: visit.rating,
      memo: visit.memo,
      good_exhibits: visit.good_exhibits_list,
      photo_urls: visit.photos.map { |p| url_for(p) },
      video_urls: visit.videos.map { |v| url_for(v) },
      created_at: visit.created_at,
      updated_at: visit.updated_at
    }
  end
end
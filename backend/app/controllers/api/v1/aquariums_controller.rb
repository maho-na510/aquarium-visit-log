class Api::V1::AquariumsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show, :search, :nearby]
  before_action :set_aquarium, only: [:show, :update, :destroy]
  
  # GET /api/v1/aquariums
  def index
    @aquariums = Aquarium.includes(:visits)
    
    # フィルタリング
    @aquariums = @aquariums.where(prefecture: params[:prefecture]) if params[:prefecture].present?
    
    # 訪問済み/未訪問フィルター（認証時のみ）
    if user_signed_in? && params[:visited].present?
      visited_ids = current_user.visited_aquariums.pluck(:id)
      @aquariums = params[:visited] == 'true' ? @aquariums.where(id: visited_ids) : @aquariums.where.not(id: visited_ids)
    end
    
    # ソート
    case params[:sort]
    when 'rating'
      @aquariums = @aquariums.left_joins(:visits)
                             .group('aquariums.id')
                             .order('AVG(visits.rating) DESC NULLS LAST')
    when 'visits'
      @aquariums = @aquariums.left_joins(:visits)
                             .group('aquariums.id')
                             .order('COUNT(visits.id) DESC')
    when 'distance'
      if params[:lat].present? && params[:lng].present?
        @aquariums = @aquariums.near([params[:lat], params[:lng]], params[:distance] || 50)
      end
    else
      @aquariums = @aquariums.order(created_at: :desc)
    end
    
    # ページネーション
    @aquariums = @aquariums.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      aquariums: serialize_aquariums(@aquariums),
      pagination: pagination_dict(@aquariums)
    }
  end
  
  # GET /api/v1/aquariums/:id
  def show
    render json: serialize_aquarium_detail(@aquarium)
  end
  
  # POST /api/v1/aquariums
  def create
    @aquarium = Aquarium.new(aquarium_params)
    @aquarium.user_id = current_user.id
    
    if @aquarium.save
      render json: serialize_aquarium_detail(@aquarium), status: :created
    else
      render json: { errors: @aquarium.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /api/v1/aquariums/:id
  def update
    if @aquarium.user_id != current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    if @aquarium.update(aquarium_params)
      render json: serialize_aquarium_detail(@aquarium)
    else
      render json: { errors: @aquarium.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/aquariums/:id
  def destroy
    if @aquarium.user_id != current_user.id
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    @aquarium.destroy
    head :no_content
  end
  
  # GET /api/v1/aquariums/search
  def search
    query = params[:q]
    return render json: { aquariums: [] } if query.blank?
    
    @aquariums = Aquarium.where('name LIKE ? OR address LIKE ?', "%#{query}%", "%#{query}%")
    
    # 良かった展示で検索
    if params[:exhibit].present?
      visit_ids = Visit.where('good_exhibits LIKE ?', "%#{params[:exhibit]}%").pluck(:aquarium_id)
      @aquariums = @aquariums.or(Aquarium.where(id: visit_ids))
    end
    
    @aquariums = @aquariums.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      aquariums: serialize_aquariums(@aquariums),
      pagination: pagination_dict(@aquariums)
    }
  end
  
  # GET /api/v1/aquariums/nearby
  def nearby
    lat = params[:lat]
    lng = params[:lng]
    distance = params[:distance] || 50
    
    return render json: { error: '位置情報が必要です' }, status: :bad_request if lat.blank? || lng.blank?
    
    @aquariums = Aquarium.near([lat, lng], distance)
    
    render json: {
      aquariums: serialize_aquariums(@aquariums)
    }
  end
  
  private
  
  def set_aquarium
    @aquarium = Aquarium.find(params[:id])
  end
  
  def aquarium_params
    params.require(:aquarium).permit(:name, :description, :address, :latitude, :longitude, 
                                     :phone_number, :website, :prefecture, opening_hours: {}, admission_fee: {})
  end
  
  def serialize_aquariums(aquariums)
    aquariums.map do |aquarium|
      {
        id: aquarium.id,
        name: aquarium.name,
        address: aquarium.address,
        prefecture: aquarium.prefecture,
        latitude: aquarium.latitude,
        longitude: aquarium.longitude,
        average_rating: aquarium.average_rating,
        visit_count: aquarium.visit_count,
        visited: user_signed_in? ? current_user.visited_aquariums.include?(aquarium) : false,
        in_wishlist: user_signed_in? ? current_user.wishlist_aquariums.include?(aquarium) : false,
        latest_photo_url: aquarium.visits.joins(:photos_attachments).last&.photos&.first&.url
      }
    end
  end
  
  def serialize_aquarium_detail(aquarium)
    {
      id: aquarium.id,
      name: aquarium.name,
      description: aquarium.description,
      address: aquarium.address,
      prefecture: aquarium.prefecture,
      latitude: aquarium.latitude,
      longitude: aquarium.longitude,
      phone_number: aquarium.phone_number,
      website: aquarium.website,
      opening_hours: aquarium.opening_hours,
      admission_fee: aquarium.admission_fee,
      average_rating: aquarium.average_rating,
      visit_count: aquarium.visit_count,
      visited: user_signed_in? ? current_user.visited_aquariums.include?(aquarium) : false,
      in_wishlist: user_signed_in? ? current_user.wishlist_aquariums.include?(aquarium) : false,
      created_by: aquarium.user_id,
      recent_visits: aquarium.visits.recent.limit(5).map { |v| serialize_visit_summary(v) }
    }
  end
  
  def serialize_visit_summary(visit)
    {
      id: visit.id,
      user_name: visit.user.name,
      visited_at: visit.visited_at,
      rating: visit.rating,
      photo_count: visit.photos.count
    }
  end
end
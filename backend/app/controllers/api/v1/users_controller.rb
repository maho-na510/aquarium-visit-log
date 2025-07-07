class Api::V1::UsersController < Api::V1::BaseController
  before_action :set_user, only: [:show, :visits, :wishlist]
  
  # GET /api/v1/users/:id
  def show
    render json: serialize_user(@user)
  end
  
  # PATCH/PUT /api/v1/users/:id
  def update
    if current_user.id != params[:id].to_i
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    if current_user.update(user_params)
      render json: serialize_user(current_user)
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # GET /api/v1/users/:id/visits
  def visits
    @visits = @user.visits.includes(:aquarium).recent.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      visits: @visits.map { |v| serialize_visit_summary(v) },
      pagination: pagination_dict(@visits)
    }
  end
  
  # GET /api/v1/users/:id/wishlist
  def wishlist
    @wishlist_items = @user.wishlist_items.includes(:aquarium).by_priority.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      wishlist_items: @wishlist_items.map { |item| serialize_wishlist_item(item) },
      pagination: pagination_dict(@wishlist_items)
    }
  end
  
  # POST /api/v1/users/:id/upload_avatar
  def upload_avatar
    if current_user.id != params[:id].to_i
      render json: { error: '権限がありません' }, status: :forbidden
      return
    end
    
    if params[:avatar].present?
      current_user.avatar.attach(params[:avatar])
      render json: { avatar_url: url_for(current_user.avatar) }
    else
      render json: { error: 'アバター画像が選択されていません' }, status: :bad_request
    end
  end
  
  private
  
  def set_user
    @user = User.find(params[:id])
  end
  
  def user_params
    params.require(:user).permit(:name, :username, favorite_aquarium_ids: [])
  end
  
  def serialize_user(user)
    {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar_url: user.avatar.attached? ? url_for(user.avatar) : nil,
      favorite_aquariums: user.favorite_aquariums.map { |a| serialize_aquarium_summary(a) },
      visit_count: user.visits.count,
      wishlist_count: user.wishlist_items.count,
      created_at: user.created_at
    }
  end
  
  def serialize_aquarium_summary(aquarium)
    {
      id: aquarium.id,
      name: aquarium.name,
      address: aquarium.address,
      prefecture: aquarium.prefecture
    }
  end
  
  def serialize_visit_summary(visit)
    {
      id: visit.id,
      aquarium: serialize_aquarium_summary(visit.aquarium),
      visited_at: visit.visited_at,
      rating: visit.rating,
      weather: visit.weather,
      photo_count: visit.photos.count
    }
  end
  
  def serialize_wishlist_item(item)
    {
      id: item.id,
      aquarium: serialize_aquarium_summary(item.aquarium),
      priority: item.priority,
      memo: item.memo,
      created_at: item.created_at
    }
  end
end
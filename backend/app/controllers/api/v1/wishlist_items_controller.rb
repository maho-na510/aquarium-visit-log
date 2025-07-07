class Api::V1::WishlistItemsController < Api::V1::BaseController
  before_action :set_wishlist_item, only: [:show, :update, :destroy]
  
  # GET /api/v1/wishlist_items
  def index
    @wishlist_items = current_user.wishlist_items.includes(:aquarium).by_priority
    
    # ページネーション
    @wishlist_items = @wishlist_items.page(params[:page]).per(params[:per] || 20)
    
    render json: {
      wishlist_items: serialize_wishlist_items(@wishlist_items),
      pagination: pagination_dict(@wishlist_items)
    }
  end
  
  # GET /api/v1/wishlist_items/:id
  def show
    render json: serialize_wishlist_item_detail(@wishlist_item)
  end
  
  # POST /api/v1/wishlist_items
  def create
    @wishlist_item = current_user.wishlist_items.build(wishlist_item_params)
    
    if @wishlist_item.save
      render json: serialize_wishlist_item_detail(@wishlist_item), status: :created
    else
      render json: { errors: @wishlist_item.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # PATCH/PUT /api/v1/wishlist_items/:id
  def update
    if @wishlist_item.update(wishlist_item_params)
      render json: serialize_wishlist_item_detail(@wishlist_item)
    else
      render json: { errors: @wishlist_item.errors.full_messages }, status: :unprocessable_entity
    end
  end
  
  # DELETE /api/v1/wishlist_items/:id
  def destroy
    @wishlist_item.destroy
    head :no_content
  end
  
  private
  
  def set_wishlist_item
    @wishlist_item = current_user.wishlist_items.find(params[:id])
  end
  
  def wishlist_item_params
    params.require(:wishlist_item).permit(:aquarium_id, :priority, :memo)
  end
  
  def serialize_wishlist_items(items)
    items.map do |item|
      {
        id: item.id,
        aquarium: {
          id: item.aquarium.id,
          name: item.aquarium.name,
          address: item.aquarium.address,
          prefecture: item.aquarium.prefecture,
          average_rating: item.aquarium.average_rating,
          visit_count: item.aquarium.visit_count
        },
        priority: item.priority,
        memo: item.memo&.truncate(100),
        created_at: item.created_at
      }
    end
  end
  
  def serialize_wishlist_item_detail(item)
    {
      id: item.id,
      aquarium: {
        id: item.aquarium.id,
        name: item.aquarium.name,
        description: item.aquarium.description,
        address: item.aquarium.address,
        prefecture: item.aquarium.prefecture,
        latitude: item.aquarium.latitude,
        longitude: item.aquarium.longitude,
        average_rating: item.aquarium.average_rating,
        visit_count: item.aquarium.visit_count
      },
      priority: item.priority,
      memo: item.memo,
      created_at: item.created_at,
      updated_at: item.updated_at
    }
  end
end
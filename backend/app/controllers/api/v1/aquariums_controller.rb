# frozen_string_literal: true

class Api::V1::AquariumsController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show, :search, :nearby, :og_image]

  before_action :set_aquarium, only: [:show, :update, :destroy, :upload_photos, :destroy_photo, :og_image, :set_header_photo]
  before_action :require_admin!, only: [:create, :update, :destroy, :upload_photos, :destroy_photo, :set_header_photo]


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

  # PUT /api/v1/aquariums/:id/set_header_photo
  def set_header_photo
    photo_id = params[:photo_id]

    return render json: { error: "photo_id が必要です" }, status: :bad_request if photo_id.blank?

    # 写真が水族館またはその訪問記録に属しているか確認
    attachment = @aquarium.photos.attachments.find_by(id: photo_id)

    unless attachment
      # 訪問記録の写真からも探す
      visit_attachment = ActiveStorage::Attachment.joins("INNER JOIN visits ON active_storage_attachments.record_id = visits.id")
                                                   .where(active_storage_attachments: { id: photo_id, name: 'photos' })
                                                   .where(visits: { aquarium_id: @aquarium.id })
                                                   .first

      return render json: { error: "指定された写真が見つかりません" }, status: :not_found unless visit_attachment
    end

    @aquarium.update(header_photo_id: photo_id)

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
    when 'prefecture'
      # 都道府県の順序を定義（北から南へ）
      prefecture_order = [
        '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
        '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
        '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
        '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
        '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
        '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
        '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
      ]
      # CASE文を使って都道府県順にソート
      order_sql = "CASE prefecture " +
        prefecture_order.map.with_index { |pref, idx| "WHEN '#{pref}' THEN #{idx}" }.join(' ') +
        " ELSE 999 END, name ASC"
      scope.order(Arel.sql(order_sql))
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

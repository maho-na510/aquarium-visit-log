class Api::V1::RankingsController < Api::V1::BaseController
  include Rails.application.routes.url_helpers
  skip_before_action :authenticate_user!
  
  # GET /api/v1/rankings/most_visited
  def most_visited
    period = params[:period] || 'all' # all, year, month
    prefecture = params[:prefecture]
    
    @aquariums = Aquarium.left_joins(:visits)
    
    # 期間でフィルター
    case period
    when 'year'
      year = params[:year] || Date.current.year
      @aquariums = @aquariums.where(visits: { visited_at: Date.new(year, 1, 1)..Date.new(year, 12, 31) })
    when 'month'
      date = Date.current
      @aquariums = @aquariums.where(visits: { visited_at: date.beginning_of_month..date.end_of_month })
    end
    
    # 都道府県でフィルター
    @aquariums = @aquariums.where(prefecture: prefecture) if prefecture.present?
    
    # 訪問数でランキング
    @aquariums = @aquariums.group('aquariums.id')
                           .order('COUNT(visits.id) DESC')
                           .limit(params[:limit] || 10)
    
    render json: {
      rankings: serialize_rankings(@aquariums, 'visit_count'),
      period: period,
      prefecture: prefecture
    }
  end
  
  # GET /api/v1/rankings/highest_rated
  def highest_rated
    min_visits = params[:min_visits] || 3 # 最低訪問数
    prefecture = params[:prefecture]

    @aquariums = Aquarium.joins(:visits)
                         .group('aquariums.id')
                         .having('COUNT(visits.id) >= ?', min_visits)

    # 都道府県でフィルター
    @aquariums = @aquariums.where(prefecture: prefecture) if prefecture.present?

    # 評価でランキング
    @aquariums = @aquariums.order('AVG(visits.rating) DESC')
                           .limit(params[:limit] || 10)

    render json: {
      rankings: serialize_rankings(@aquariums, 'average_rating'),
      min_visits: min_visits,
      prefecture: prefecture
    }
  end

  # GET /api/v1/rankings/trending
  def trending
    days = params[:days]&.to_i || 30 # デフォルトは30日
    prefecture = params[:prefecture]

    start_date = days.days.ago.beginning_of_day

    @aquariums = Aquarium.joins(:visits)
                         .where(visits: { visited_at: start_date.. })
                         .group('aquariums.id')

    # 都道府県でフィルター
    @aquariums = @aquariums.where(prefecture: prefecture) if prefecture.present?

    # 最近の訪問数でランキング
    @aquariums = @aquariums.order('COUNT(visits.id) DESC')
                           .limit(params[:limit] || 10)

    render json: {
      rankings: serialize_rankings(@aquariums, 'trending'),
      days: days,
      prefecture: prefecture
    }
  end

  # GET /api/v1/rankings/wishlist_champions
  def wishlist_champions
    prefecture = params[:prefecture]

    @aquariums = Aquarium.left_joins(:wishlist_items)
                         .group('aquariums.id')
                         .select('aquariums.*, COUNT(wishlist_items.id) as wishlist_count')
                         .having('COUNT(wishlist_items.id) > 0')

    # 都道府県でフィルター
    @aquariums = @aquariums.where(prefecture: prefecture) if prefecture.present?

    # ウィッシュリスト登録数でランキング
    @aquariums = @aquariums.order('wishlist_count DESC')
                           .limit(params[:limit] || 10)

    render json: {
      rankings: serialize_rankings(@aquariums, 'wishlist_count'),
      prefecture: prefecture
    }
  end

  # GET /api/v1/rankings/hidden_gems
  def hidden_gems
    min_rating = params[:min_rating]&.to_f || 4.5 # 最低評価
    max_visits = params[:max_visits]&.to_i || 10 # 最大訪問数
    prefecture = params[:prefecture]

    @aquariums = Aquarium.joins(:visits)
                         .group('aquariums.id')
                         .having('AVG(visits.rating) >= ?', min_rating)
                         .having('COUNT(visits.id) <= ?', max_visits)
                         .having('COUNT(visits.id) >= 2') # 最低2件の評価が必要

    # 都道府県でフィルター
    @aquariums = @aquariums.where(prefecture: prefecture) if prefecture.present?

    # 評価の高い順にランキング
    @aquariums = @aquariums.order('AVG(visits.rating) DESC')
                           .limit(params[:limit] || 10)

    render json: {
      rankings: serialize_rankings(@aquariums, 'hidden_gem'),
      min_rating: min_rating,
      max_visits: max_visits,
      prefecture: prefecture
    }
  end

  private

  def default_url_options
    Rails.application.routes.default_url_options
  end

  def serialize_rankings(aquariums, metric_type)
    aquariums.map.with_index do |aquarium, index|
      data = {
        rank: index + 1,
        id: aquarium.id,
        name: aquarium.name,
        address: aquarium.address,
        prefecture: aquarium.prefecture,
        latitude: aquarium.latitude,
        longitude: aquarium.longitude
      }
      
      case metric_type
      when 'visit_count'
        data[:visit_count] = aquarium.visits.count
        data[:latest_visit] = aquarium.visits.maximum(:visited_at)
      when 'average_rating'
        data[:average_rating] = aquarium.visits.average(:rating).to_f.round(2)
        data[:rating_count] = aquarium.visits.count
      when 'trending'
        data[:recent_visit_count] = aquarium.visits.count
        data[:average_rating] = aquarium.visits.average(:rating)&.to_f&.round(2) || 0
      when 'wishlist_count'
        data[:wishlist_count] = aquarium.try(:wishlist_count) || aquarium.wishlist_items.count
        data[:average_rating] = aquarium.visits.average(:rating)&.to_f&.round(2) || 0
        data[:visit_count] = aquarium.visits.count
      when 'hidden_gem'
        data[:average_rating] = aquarium.visits.average(:rating).to_f.round(2)
        data[:visit_count] = aquarium.visits.count
        data[:rating_count] = aquarium.visits.count
      end
      
      # TOP5は特別マーク
      data[:is_top5] = index < 5
      
      # 最新の写真URL
      latest_visit = aquarium.visits.joins(:photos_attachments).last
      if latest_visit&.photos&.any?
        data[:latest_photo_url] = rails_blob_url(
          latest_visit.photos.first,
          host: default_url_options[:host],
          port: default_url_options[:port],
          protocol: 'http'
        )
      end
      
      data
    end
  end
end
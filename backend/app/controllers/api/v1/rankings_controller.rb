class Api::V1::RankingsController < Api::V1::BaseController
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
  
  private
  
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
      end
      
      # TOP5は特別マーク
      data[:is_top5] = index < 5
      
      # 最新の写真URL
      latest_visit = aquarium.visits.joins(:photos_attachments).last
      data[:latest_photo_url] = latest_visit.photos.first.url if latest_visit&.photos&.any?
      
      data
    end
  end
end
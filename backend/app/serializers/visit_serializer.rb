# frozen_string_literal: true

class VisitSerializer
  def initialize(visit)
    @visit = visit
  end

  def as_summary_json
    {
      id: @visit.id,
      user_name: @visit.user.name,
      visited_at: @visit.visited_at,
      rating: @visit.rating,
      photo_count: @visit.photos.count
    }
  end
end

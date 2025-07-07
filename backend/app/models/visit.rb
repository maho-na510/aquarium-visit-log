class Visit < ApplicationRecord
  belongs_to :user
  belongs_to :aquarium
  
  has_many_attached :photos
  has_many_attached :videos
  
  validates :visited_at, presence: true
  validates :rating, inclusion: { in: 1..5 }, allow_nil: true
  validate :validate_media_count
  
  # スコープ
  scope :recent, -> { order(visited_at: :desc) }
  scope :by_year, ->(year) { where(visited_at: Date.new(year, 1, 1)..Date.new(year, 12, 31)) }
  scope :by_month, ->(year, month) {
    start_date = Date.new(year, month, 1)
    end_date = start_date.end_of_month
    where(visited_at: start_date..end_date)
  }
  
  # 良かった展示のgetter/setter
  def good_exhibits_list
    return [] if good_exhibits.blank?
    JSON.parse(good_exhibits)
  end
  
  def good_exhibits_list=(exhibits)
    self.good_exhibits = exhibits.to_json
  end
  
  private
  
  def validate_media_count
    if photos.length > 10
      errors.add(:photos, "は10枚までです")
    end
    
    if videos.length > 3
      errors.add(:videos, "は3本までです")
    end
  end
end
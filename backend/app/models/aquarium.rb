class Aquarium < ApplicationRecord
  has_many :visits, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy
  has_many :visitors, through: :visits, source: :user
  has_many_attached :photos
  
  validates :name, presence: true
  validates :address, presence: true
  validates :latitude, presence: true, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 }
  validates :longitude, presence: true, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 }
  
  # Geocoderの設定
  geocoded_by :address
  after_validation :geocode, if: :address_changed?
  
  # スコープ
  scope :near_location, ->(lat, lng, distance = 50) {
    near([lat, lng], distance, units: :km)
  }
  
  # ランキング用メソッド
  def average_rating
    visits.average(:rating) || 0
  end
  
  def visit_count
    visits.count
  end
end
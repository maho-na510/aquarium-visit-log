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

  # ヘッダー写真取得メソッド
  def header_photo
    return nil unless header_photo_id
    photos.attachments.find_by(id: header_photo_id)
  end

  # 全ての写真（水族館の写真 + 訪問記録の写真）
  def all_photos
    aquarium_photos = photos.attachments.map { |a| { source: 'aquarium', attachment: a } }
    visit_photos = visits.joins(:photos_attachments).includes(photos_attachments: :blob)
                         .flat_map { |v| v.photos.attachments.map { |a| { source: 'visit', attachment: a, visit: v } } }
    aquarium_photos + visit_photos
  end
end
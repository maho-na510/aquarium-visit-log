class WishlistItem < ApplicationRecord
  belongs_to :user
  belongs_to :aquarium
  
  validates :priority, inclusion: { in: 1..5 }, allow_nil: true
  
  # スコープ
  scope :by_priority, -> { order(priority: :desc, created_at: :desc) }
  
  # 同じ水族館を重複して追加できないようにする
  validates :aquarium_id, uniqueness: { scope: :user_id, message: "はすでにリストに追加されています" }
end
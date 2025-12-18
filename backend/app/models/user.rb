class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :visits, dependent: :destroy
  has_many :wishlist_items, dependent: :destroy
  has_many :visited_aquariums, through: :visits, source: :aquarium
  has_many :wishlist_aquariums, through: :wishlist_items, source: :aquarium
  has_many :created_aquariums, class_name: 'Aquarium', foreign_key: 'user_id'
  
  has_one_attached :avatar
  
  validates :name, presence: true
  validates :username, presence: true, uniqueness: true
  
  def admin?
    role == "admin"
  end

  # お気に入り水族館のgetter/setter
  def favorite_aquariums
    return [] if favorite_aquarium_ids.blank?
    Aquarium.where(id: JSON.parse(favorite_aquarium_ids))
  end
  
  def favorite_aquariums=(aquariums)
    self.favorite_aquarium_ids = aquariums.map(&:id).to_json
  end
  
  # 認証をusernameで行う
  def self.find_for_database_authentication(warden_conditions)
    conditions = warden_conditions.dup
    if (login = conditions.delete(:login))
      where(conditions.to_h).where(["lower(username) = :value OR lower(email) = :value", { value: login.downcase }]).first
    elsif conditions.has_key?(:username) || conditions.has_key?(:email)
      where(conditions.to_h).first
    end
  end
end

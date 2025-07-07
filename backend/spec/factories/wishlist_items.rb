FactoryBot.define do
  factory :wishlist_item do
    user { nil }
    aquarium { nil }
    priority { 1 }
    memo { "MyText" }
  end
end

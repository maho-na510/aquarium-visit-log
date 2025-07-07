FactoryBot.define do
  factory :visit do
    user { nil }
    aquarium { nil }
    visited_at { "2025-07-06" }
    memo { "MyText" }
    rating { 1 }
  end
end

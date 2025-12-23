FactoryBot.define do
  factory :visit do
    association :user
    association :aquarium
    visited_at { Faker::Date.between(from: 1.year.ago, to: Date.today) }
    memo { Faker::Lorem.paragraph }
    rating { rand(1..5) }
  end
end

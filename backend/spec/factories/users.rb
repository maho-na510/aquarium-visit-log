FactoryBot.define do
  factory :user do
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    password_confirmation { "password123" }
    sequence(:username) { |n| "user#{n}" }
    name { Faker::Name.name }

    trait :admin do
      role { "admin" }
    end
  end
end

FactoryBot.define do
  factory :aquarium do
    sequence(:name) { |n| "#{Faker::Company.name} Aquarium #{n}" }
    description { Faker::Lorem.paragraph(sentence_count: 3) }
    address { Faker::Address.full_address }
    prefecture { "東京都" }
    latitude { Faker::Address.latitude }
    longitude { Faker::Address.longitude }
    phone_number { Faker::PhoneNumber.phone_number }
    website { Faker::Internet.url }
    opening_hours { "9:00-18:00" }
    admission_fee { "大人: 2,000円, 子供: 1,000円" }
  end
end

FactoryBot.define do
  factory :aquarium do
    name { "MyString" }
    description { "MyText" }
    address { "MyString" }
    latitude { 1.5 }
    longitude { 1.5 }
    phone_number { "MyString" }
    website { "MyString" }
    opening_hours { "" }
    admission_fee { "" }
  end
end

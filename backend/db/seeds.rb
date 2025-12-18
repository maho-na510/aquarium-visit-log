aquariums_data = [
  {
    name: "沖縄美ら海水族館",
    description: "世界最大級の水槽「黒潮の海」を有する水族館。ジンベエザメやマンタの複数飼育で有名。",
    address: "沖縄県国頭郡本部町石川424",
    latitude: 26.694051,
    longitude: 127.878123,
    phone_number: "0980-48-3748",
    website: "https://churaumi.okinawa/",
    prefecture: "沖縄県",
    opening_hours: { 
      regular: "8:30-18:30",
      summer: "8:30-20:00"
    },
    admission_fee: {
      adult: 2180,
      high_school: 1440,
      elementary: 710
    }
  },
  {
    name: "海遊館",
    description: "太平洋を取り囲む「環太平洋火山帯」の自然環境を再現した世界最大級の水族館。",
    address: "大阪府大阪市港区海岸通1-1-10",
    latitude: 34.654514,
    longitude: 135.428951,
    phone_number: "06-6576-5501",
    website: "https://www.kaiyukan.com/",
    prefecture: "大阪府",
    opening_hours: { 
      regular: "10:00-20:00"
    },
    admission_fee: {
      adult: 2700,
      child: 1400,
      infant: 700
    }
  },
  {
    name: "名古屋港水族館",
    description: "シャチやベルーガなど鯨類の展示が充実。イルカパフォーマンスも人気。",
    address: "愛知県名古屋市港区港町1-3",
    latitude: 35.090634,
    longitude: 136.885455,
    phone_number: "052-654-7080",
    website: "https://nagoyaaqua.jp/",
    prefecture: "愛知県",
    opening_hours: { 
      regular: "9:30-17:30",
      golden_week: "9:30-20:00"
    },
    admission_fee: {
      adult: 2030,
      high_school: 2030,
      elementary: 1010,
      infant: 500
    }
  },
  {
    name: "サンシャイン水族館",
    description: "都市型高層水族館。「天空のペンギン」など都市の空を泳ぐような展示が特徴。",
    address: "東京都豊島区東池袋3-1 サンシャインシティ ワールドインポートマートビル屋上",
    latitude: 35.729440,
    longitude: 139.719690,
    phone_number: "03-3989-3466",
    website: "https://sunshinecity.jp/aquarium/",
    prefecture: "東京都",
    opening_hours: { 
      spring_summer: "9:00-21:00",
      autumn_winter: "10:00-18:00"
    },
    admission_fee: {
      adult: 2600,
      child: 1300,
      infant: 800
    }
  },
  {
    name: "すみだ水族館",
    description: "東京スカイツリータウン内にある水族館。国内最大級の屋内開放型水槽が特徴。",
    address: "東京都墨田区押上1-1-2 東京スカイツリータウン・ソラマチ5-6F",
    latitude: 35.710332,
    longitude: 139.810700,
    phone_number: "03-5619-1821",
    website: "https://www.sumida-aquarium.com/",
    prefecture: "東京都",
    opening_hours: { 
      weekday: "10:00-20:00",
      holiday: "9:00-21:00"
    },
    admission_fee: {
      adult: 2500,
      high_school: 1800,
      elementary: 1200,
      infant: 800
    }
  }
]

# 水族館データを作成
aquariums_data.each do |data|
  Aquarium.find_or_create_by!(name: data[:name]) do |aquarium|
    aquarium.description = data[:description]
    aquarium.address = data[:address]
    aquarium.latitude = data[:latitude]
    aquarium.longitude = data[:longitude]
    aquarium.phone_number = data[:phone_number]
    aquarium.website = data[:website]
    aquarium.prefecture = data[:prefecture]
    aquarium.opening_hours = data[:opening_hours]
    aquarium.admission_fee = data[:admission_fee]
  end
end

puts "Created #{Aquarium.count} aquariums"

# テストユーザーを作成
test_user = User.find_or_create_by!(email: "test@example.com") do |user|
  user.name = "テストユーザー"
  user.username = "testuser"
  user.password = "password123"
end

puts "Created test user: #{test_user.email}"
require 'rails_helper'

RSpec.describe "Api::V1::Rankings", type: :request do
  describe "GET /api/v1/rankings/most_visited" do
    let!(:user) { create(:user) }
    let!(:aquarium1) { create(:aquarium, name: "Popular Aquarium") }
    let!(:aquarium2) { create(:aquarium, name: "Less Popular Aquarium") }
    let!(:aquarium3) { create(:aquarium, name: "Another Aquarium") }

    before do
      # Create visits for ranking
      create_list(:visit, 10, aquarium: aquarium1, user: user)
      create_list(:visit, 5, aquarium: aquarium2, user: user)
      create_list(:visit, 2, aquarium: aquarium3, user: user)
    end

    it "returns aquariums ranked by visit count" do
      get "/api/v1/rankings/most_visited"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json['rankings']).to be_an(Array)
      expect(json['rankings'].length).to be <= 10
      expect(json['rankings'].first['name']).to eq("Popular Aquarium")
      expect(json['rankings'].first['rank']).to eq(1)
      expect(json['rankings'].first['is_top5']).to be true
    end

    it "accepts limit parameter" do
      get "/api/v1/rankings/most_visited", params: { limit: 2 }

      json = JSON.parse(response.body)
      expect(json['rankings'].length).to eq(2)
    end

    it "accepts period parameter" do
      get "/api/v1/rankings/most_visited", params: { period: 'month' }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['period']).to eq('month')
    end

    it "accepts prefecture parameter" do
      get "/api/v1/rankings/most_visited", params: { prefecture: '東京都' }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json['prefecture']).to eq('東京都')
    end
  end

  describe "GET /api/v1/rankings/highest_rated" do
    let!(:user) { create(:user) }
    let!(:aquarium1) { create(:aquarium, name: "Excellent Aquarium") }
    let!(:aquarium2) { create(:aquarium, name: "Good Aquarium") }

    before do
      # Create high-rated visits
      create_list(:visit, 5, aquarium: aquarium1, user: user, rating: 5)
      create_list(:visit, 5, aquarium: aquarium2, user: user, rating: 3)
    end

    it "returns aquariums ranked by average rating" do
      get "/api/v1/rankings/highest_rated"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json['rankings']).to be_an(Array)
      expect(json['rankings'].first['name']).to eq("Excellent Aquarium")
      expect(json['rankings'].first['average_rating']).to eq(5.0)
    end

    it "filters by minimum visits" do
      get "/api/v1/rankings/highest_rated", params: { min_visits: 10 }

      json = JSON.parse(response.body)
      expect(json['min_visits']).to eq("10")  # API returns string from params
    end
  end

  describe "GET /api/v1/rankings/trending" do
    let!(:user) { create(:user) }
    let!(:aquarium1) { create(:aquarium, name: "Trending Aquarium") }
    let!(:aquarium2) { create(:aquarium, name: "Old Aquarium") }

    before do
      # Create recent visits
      create_list(:visit, 5, aquarium: aquarium1, user: user, visited_at: 1.day.ago)
      # Create old visits
      create_list(:visit, 10, aquarium: aquarium2, user: user, visited_at: 60.days.ago)
    end

    it "returns recently popular aquariums" do
      get "/api/v1/rankings/trending", params: { days: 30 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json['rankings']).to be_an(Array)
      expect(json['days']).to eq(30)
      # Trending aquarium should be first because it has recent visits
      expect(json['rankings'].first['name']).to eq("Trending Aquarium")
    end
  end

  describe "GET /api/v1/rankings/wishlist_champions" do
    let!(:user1) { create(:user) }
    let!(:user2) { create(:user) }
    let!(:aquarium1) { create(:aquarium, name: "Most Wished Aquarium") }
    let!(:aquarium2) { create(:aquarium, name: "Less Wished Aquarium") }

    before do
      create(:wishlist_item, user: user1, aquarium: aquarium1)
      create(:wishlist_item, user: user2, aquarium: aquarium1)
      create(:wishlist_item, user: user1, aquarium: aquarium2)
    end

    it "returns aquariums ranked by wishlist count" do
      get "/api/v1/rankings/wishlist_champions"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json['rankings']).to be_an(Array)
      expect(json['rankings'].first['name']).to eq("Most Wished Aquarium")
    end
  end

  describe "GET /api/v1/rankings/hidden_gems" do
    let!(:user) { create(:user) }
    let!(:aquarium1) { create(:aquarium, name: "Hidden Gem") }
    let!(:aquarium2) { create(:aquarium, name: "Popular But Low Rated") }

    before do
      # Create a hidden gem: high rating, low visit count
      create_list(:visit, 3, aquarium: aquarium1, user: user, rating: 5)
      # Create popular but doesn't meet criteria
      create_list(:visit, 20, aquarium: aquarium2, user: user, rating: 3)
    end

    it "returns high-rated aquariums with low visit counts" do
      get "/api/v1/rankings/hidden_gems", params: { min_rating: 4.5, max_visits: 10 }

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)

      expect(json['rankings']).to be_an(Array)
      expect(json['min_rating']).to eq(4.5)
      expect(json['max_visits']).to eq(10)
      # Only hidden gem should appear
      expect(json['rankings'].first['name']).to eq("Hidden Gem")
    end
  end
end

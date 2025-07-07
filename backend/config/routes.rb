Rails.application.routes.draw do
  devise_for :users
  
  namespace :api do
    namespace :v1 do
      resources :aquariums do
        collection do
          get :search
          get :nearby
        end
      end
      
      resources :visits do
        member do
          post :upload_photos
        end
      end
      
      resources :wishlist_items
      
      resources :users, only: [:show, :update] do
        member do
          get :visits
          get :wishlist
          post :upload_avatar
        end
      end
      
      # ランキング
      get 'rankings/most_visited', to: 'rankings#most_visited'
      get 'rankings/highest_rated', to: 'rankings#highest_rated'
    end
  end
  
  # ヘルスチェック
  get "up" => "rails/health#show", as: :rails_health_check
end
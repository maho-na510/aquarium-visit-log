Rails.application.routes.draw do
  devise_for :users

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      post   'login',  to: 'sessions#create'
      delete 'logout', to: 'sessions#destroy'
      get    'me',     to: 'sessions#me'
      post   'register', to: 'registrations#create'

      resources :aquariums do
        collection do
          get :search
          get :nearby
        end
        member do
          get :og_image
          post :upload_photos
          delete "photos/:photo_id", to: "aquariums#destroy_photo"
          put :set_header_photo
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

  get "up" => "rails/health#show", as: :rails_health_check

  # Catch React dev server websocket attempts (just return 404 silently)
  get "/ws", to: proc { [404, {}, ['']] }
end

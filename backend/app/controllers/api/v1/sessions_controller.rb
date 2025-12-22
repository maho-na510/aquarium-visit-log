# backend/app/controllers/api/v1/sessions_controller.rb
# frozen_string_literal: true

class Api::V1::SessionsController < ApplicationController
  respond_to :json

  def create
    user = User.find_for_authentication(email: params[:email])

    if user&.valid_password?(params[:password])
      sign_in(user)
      render json: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }, status: :ok
    else
      render json: { error: 'メールアドレスまたはパスワードが違います' }, status: :unauthorized
    end
  end

  def destroy
    if user_signed_in?
      sign_out(current_user)
      reset_session
    end
    head :no_content
  end

  def me
    if user_signed_in?
      render json: {
        user: {
          id: current_user.id,
          name: current_user.name,
          username: current_user.username,
          email: current_user.email,
          role: current_user.role
        }
      }
    else
      render json: { user: nil }
    end
  end
end

# frozen_string_literal: true

class Api::V1::RegistrationsController < ApplicationController
  respond_to :json

  # POST /api/v1/register
  def create
    user = User.new(registration_params)

    if user.save
      sign_in(user)
      render json: {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def registration_params
    params.require(:user).permit(:email, :password, :password_confirmation, :name, :username)
  end
end

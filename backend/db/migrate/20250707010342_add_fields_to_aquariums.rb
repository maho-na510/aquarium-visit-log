class AddFieldsToAquariums < ActiveRecord::Migration[7.1]
  def change
    add_column :aquariums, :prefecture, :string
    add_column :aquariums, :user_id, :integer
  end
end

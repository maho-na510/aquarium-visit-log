class AddHeaderPhotoToAquariums < ActiveRecord::Migration[7.1]
  def change
    add_column :aquariums, :header_photo_id, :integer
    add_index :aquariums, :header_photo_id
  end
end

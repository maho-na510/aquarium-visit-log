class CreateWishlistItems < ActiveRecord::Migration[7.1]
  def change
    create_table :wishlist_items do |t|
      t.references :user, null: false, foreign_key: true
      t.references :aquarium, null: false, foreign_key: true
      t.integer :priority
      t.text :memo

      t.timestamps
    end
  end
end

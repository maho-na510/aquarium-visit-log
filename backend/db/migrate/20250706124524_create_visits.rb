class CreateVisits < ActiveRecord::Migration[7.1]
  def change
    create_table :visits do |t|
      t.references :user, null: false, foreign_key: true
      t.references :aquarium, null: false, foreign_key: true
      t.date :visited_at
      t.text :memo
      t.integer :rating

      t.timestamps
    end
  end
end

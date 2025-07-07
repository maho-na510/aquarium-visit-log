class CreateAquaria < ActiveRecord::Migration[7.1]
  def change
    create_table :aquariums do |t|  
      t.string :name, null: false
      t.text :description
      t.string :address
      t.float :latitude
      t.float :longitude
      t.string :phone_number
      t.string :website
      t.json :opening_hours
      t.json :admission_fee

      t.timestamps
    end
    
    add_index :aquariums, :name  
    add_index :aquariums, [:latitude, :longitude]  
  end
end
class AddFieldsToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :username, :string
    add_column :users, :favorite_aquarium_ids, :text
    add_index :users, :username, unique: true
  end
end

# db/migrate/xxx_add_fields_to_visits.rb
class AddFieldsToVisits < ActiveRecord::Migration[7.1]
  def change
    add_column :visits, :weather, :string
    add_column :visits, :good_exhibits, :text
  end
end

# db/migrate/xxx_add_fields_to_aquariums.rb
class AddFieldsToAquariums < ActiveRecord::Migration[7.1]
  def change
    add_column :aquariums, :prefecture, :string
    add_column :aquariums, :user_id, :integer
    add_index :aquariums, :prefecture
    add_index :aquariums, :user_id
  end
end
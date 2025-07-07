class AddFieldsToVisits < ActiveRecord::Migration[7.1]
  def change
    add_column :visits, :weather, :string
    add_column :visits, :good_exhibits, :text
  end
end

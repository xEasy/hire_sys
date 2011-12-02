class AddGarageToHireItems < ActiveRecord::Migration
  def self.up
    add_column :hire_items, :garage, :string
    add_index :hire_items, :garage
  end

  def self.down
    remove_column :hire_items, :garage
  end
end

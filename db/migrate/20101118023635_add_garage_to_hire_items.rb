class AddGarageToHireItems < ActiveRecord::Migration
  def self.up
    add_column :hire_items, :garage, :string
  end

  def self.down
    remove_column :hire_items, :garage
  end
end

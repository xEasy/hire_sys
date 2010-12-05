class AddReturnItemsCountToHireItem < ActiveRecord::Migration
  def self.up
    add_column :hire_items, :return_items, :integer, :default => 0
  end

  def self.down
    remove_column :hire_items, :return_items
  end
end

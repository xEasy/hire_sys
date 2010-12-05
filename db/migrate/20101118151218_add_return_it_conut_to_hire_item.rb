class AddReturnItConutToHireItem < ActiveRecord::Migration
  def self.up
    add_column :hire_items, :return_items_count, :integer, :default=>0
  end

  def self.down
    remove_column :hire_items, :return_items_count 
  end
end

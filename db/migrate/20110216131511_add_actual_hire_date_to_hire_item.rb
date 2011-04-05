class AddActualHireDateToHireItem < ActiveRecord::Migration
  def self.up
    add_column :hire_items, :actual_hire_date, :date
  end

  def self.down
    remove_column :hire_items, :actual_hire_date
  end
end

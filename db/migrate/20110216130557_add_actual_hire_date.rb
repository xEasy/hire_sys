class AddActualHireDate < ActiveRecord::Migration
  def self.up
    add_column :sew_hire_orders, :actual_hire_date, :date
  end

  def self.down
    remove_column :sew_hire_orders, :actual_hire_date, :date
  end
end

class AddCreateTimeToHireAndReturnOrder < ActiveRecord::Migration
  def self.up
    add_column :sew_hire_orders, :create_time, :string
    add_column :sew_return_orders, :create_time, :string
  end

  def self.down
    remove_column :sew_hire_orders, :create_time, :string
    remove_column :sew_return_orders, :create_time, :string
  end
end

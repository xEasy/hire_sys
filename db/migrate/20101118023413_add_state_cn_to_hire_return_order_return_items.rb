class AddStateCnToHireReturnOrderReturnItems < ActiveRecord::Migration
  def self.up
    add_column :sew_hire_orders, :state_cn, :string
    add_column :sew_return_orders, :state_cn, :string
    add_column :return_items, :state_cn, :string
  end

  def self.down
    remove_column :sew_hire_orders, :state_cn
    remove_column :sew_return_orders, :state_cn
    remove_column :return_items, :state_cn 
  end
end

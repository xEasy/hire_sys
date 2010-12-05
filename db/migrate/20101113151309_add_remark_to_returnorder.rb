class AddRemarkToReturnorder < ActiveRecord::Migration
  def self.up
  add_column :sew_return_orders , :remark , :string
  end

  def self.down
  end
end

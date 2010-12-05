class AddTotalToReturnItems < ActiveRecord::Migration
  def self.up
    add_column :return_items, :total, :integer
  end

  def self.down
    remove_column :return_items, :total
  end
end

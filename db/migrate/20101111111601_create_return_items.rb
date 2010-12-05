class CreateReturnItems < ActiveRecord::Migration
  def self.up
    create_table :return_items do |t|
      t.integer     :hire_item_id
      t.integer     :sew_return_order_id
      t.integer     :count
      t.date        :return_date
      t.string      :remark
      t.string      :pay_state

      t.timestamps
    end
  end

  def self.down
    drop_table :return_items
  end
end

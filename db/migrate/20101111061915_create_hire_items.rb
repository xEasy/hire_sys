class CreateHireItems < ActiveRecord::Migration
  def self.up
    create_table :hire_items do |t|
      t.integer    :sew_id
      t.integer    :count
      t.string     :cloth_number
      t.date       :hire_date
      t.date       :expect_return_date
      t.string     :dep_remark
      t.integer    :price 
      t.string     :purchasing_remark
      t.integer    :sew_hire_order_id

      t.timestamps
    end
  end

  def self.down
    drop_table :hire_items
  end
end

class CreateSewHireOrders < ActiveRecord::Migration
  def self.up
    create_table :sew_hire_orders do |t|
      t.string  :number,  :limit => 40
      t.date    :create_date
      t.string  :hire_person
      t.integer :department_id
      t.string  :state
      t.string  :remark
      t.integer :operation_record_id

      t.timestamps
    end
  end

  def self.down
    drop_table :sew_hire_orders
  end
end

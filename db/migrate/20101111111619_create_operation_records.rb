class CreateOperationRecords < ActiveRecord::Migration
  def self.up
    create_table :operation_records do |t|
      t.date     :op_date
      t.integer  :user_id
      t.string   :op_type
      t.integer  :order_id

      t.timestamps
    end
  end

  def self.down
    drop_table :operation_records
  end
end

class CreateSewReturnOrders < ActiveRecord::Migration
  def self.up
    create_table :sew_return_orders do |t|
      t.string     :number
      t.date       :create_date
      t.integer    :department_id
      t.string     :return_person
      t.string     :sew_dealer
      t.string     :state

      t.timestamps
    end
  end

  def self.down
    drop_table :sew_return_orders
  end
end

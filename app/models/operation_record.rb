# == Schema Infoamtion
#
# Table name: operation_records
#
# id        :integer(4)  not null, primary key
# op_date   :date
# user_id   :integer
# op_type   :string   /批准租车/批准退车/取消租车/取消退车/付款/
# order_id  :integer
#

class OperationRecord < ActiveRecord::Base
  belongs_to   :hire_order ,
               :class_name  => "SewHireOrder",
               :foreign_key => "order_id"
  
  belongs_to   :return_order,
               :class_name  => "SewReturnOrder",
               :foreign_key => "order_id"

  belongs_to   :user
end

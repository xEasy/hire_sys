# == Schema Infoamtion
#
# Table name: sew_hrie_order
#
# id              :integer(4)  not null, primary key
# number          :string
# create_date     :date
# hire_person     :string
# department_id   :integer  部门ID
# state           :string   
# state_cn        :string
# remark          :string

class SewHireOrder < ActiveRecord::Base
  belongs_to  :department
  has_many    :hire_items
  has_many    :op_records,
              :class_name => "OperationRecord",
              :order      => "create_at"

  accepts_nested_attributes_for :hire_items

  attr_accessor :delete_item_ids
  after_update  :delete_item_ids

  validates_presence_of :create_date   , :message => "租车申请单日期不能为空"

  before_save :save_state_cn

  state_machine :initial => :pending do
    event(:dep_approve) { transition [:pending] => :dep_approved}
    event(:approve) { transition [:pending,:dep_approved] => :approved }
    event(:cancel) { transition [:pending,:dep_approved] => :cancel }
  end

  StateCn = {
    "pending" => "待批准",
    "dep_approved" => "主管已批",
    "approved" => "批复完成",
    "cancel" => "取消"
  }

  def self.states_for_query
    hs = []
    StateCn.each { |k, v| hs << { :value => v } }
    hs
  end

  def delete_item_ids
    if !@delete_item_ids.blank?
      @delete_item_ids.each do |id|
        SewHireOrder.find(id).destory if(SewHireOrder.exists? id)
      end
    end
  end

  def department_name
    self.department == nil ? "" : self.department.name.to_s
  end

  def save_state_cn
    state_cn_become = StateCn[self.state]
    self.state_cn = state_cn_become 
  end

end

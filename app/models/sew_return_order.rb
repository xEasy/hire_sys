# == Schema Infoamtion
#
# Table name: sew_return_orders
#
# id        :integer(4)  not null, primary key
# number    :string
# create_date  :date
# department_id :integer
# return_person :string
# sew_dealer    :string
# state         :string
# state_cn      :string
# remark        :string
#

class SewReturnOrder < ActiveRecord::Base
  has_many   :op_records,
             :class_name  => "OperationRecord",
             :order       => "created_at"
  belongs_to :department
  has_many   :return_items

  validates_presence_of :create_date   , :message => "请填写退车单日期"


  accepts_nested_attributes_for :return_items

  attr_accessor :delete_item_ids
  after_update  :delete_item_ids

  before_save :save_state_cn

  state_machine :initial => :pending do 
    event(:approve) { transition [:pending] => :approved }
    event(:cancel)  { transition [:pending] => :cancel }
  end

  StateCn = {
    "pending" => "待批准",
    "approved" => "已批准",
    "cancel" => "取消"
  }

  def self.states_for_query
    rs = []
    StateCn.each { |k, v| rs << { :value => v } }
    rs
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

  def created_time
    created_at
  end

  def save_state_cn
    state_cn_become = StateCn[self.state]
    self.state_cn = state_cn_become 
  end

  def create_daytime
    create_date.to_s + " " + create_time
  end
  
end

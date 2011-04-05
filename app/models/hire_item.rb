# == Schema Infoamtion
#
# Table name: hire_items
#
# id        :integer(4)  not null, primary key
# sew_id    :integer    衣车ID
# count     :integer
# cloth_number :string   
# hire_date    :date
# expect_return_date  :date
# dep_remark          :string
# price               :integer
# purchasing_remark   :string
# sew_hire_order_id   :integer
# return_items_count  :integer
# garage              :string
require 'state_machine'

class HireItem < ActiveRecord::Base
  belongs_to   :sew_hire_order
  belongs_to   :sew_firm
  belongs_to   :sew
  has_many     :return_items

  validates_presence_of :sew_id   , :message => "请选择衣车类型"
  validates_presence_of :count    , :message => "请填写租车数量"
  validates_presence_of :hire_date, :message => "请填写租车日期"
  validates_presence_of :expect_return_date , :message => "请填写租车预计退还日期"

  after_update :update_return_items_total

  def self.garage_tree
    leafs = []
    records = HireItem.find(:all,:select=>"garage, id",:order => "garage ASC",:group => "garage",:conditions => "return_items_count > 0")
    records.each do |s|
      leafs << { "text" => s.garage, "id" => "#{s.id}","leaf" => true }
    end
    leafs
  end

  def hire_item_id
    self.id
  end

  def state
      self.sew_hire_order.state_cn
  end

  def sew_name
      self.sew == nil ? "" : self.sew.sew_name
  end

  def hire_person
    self.sew_hire_order == nil ? "" : self.sew_hire_order.hire_person
  end

  def department
    self.sew_hire_order.department_name
  end

  def hire_number
    self.sew_hire_order == nil ? "" : self.sew_hire_order.number
  end
  #可退车的数量等于租车数量-（已批准退车数量+退车中的数量）
  def retain_count
    can_not_return_count = self.returned_count + self.returning_count
    retain_count = count - can_not_return_count
  end
  def returned_count
    self.return_items.sew_return_order_state_equals( ['approved'] ).sum(:count) 
  end
  def returning_count
   self.return_items.sew_return_order_state_equals( ['pending'] ).sum(:count) 
  end
  #可退车的租车单项目
  def self.can_be_returned_items_id
    ids = []
    self.all.each { |h| ( ids << h.id ) if h.retain_count > 0 }
    ids
  end
  
  private
    def update_return_items_total
      self.return_items.each { |r| r.save }
    end
end

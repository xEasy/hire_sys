# == Schema Infoamtion
#
# Table name: departments
#
# id        :integer(4)  not null, primary key
# name      :string

class Department < ActiveRecord::Base
  has_many    :sew_hire_orders,
              :order => 'created_at DESC'

  has_many    :sew_return_orders,
              :order => 'create_at DESC'

  def self.for_select
    deps = []
    self.all.each { |department| deps << [department.name,department.id]  }
    deps
  end

  def self.for_query
    rs = []
    self.all.each { |department| rs << { :value => department.name } }
    rs
  end
  
  
end

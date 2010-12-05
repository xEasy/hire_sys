# == Schema Infoamtion
#
# Table name: sews
#
# id        :integer(4)  not null, primary key
# name      :string
# sew_type      :string


class Sew < ActiveRecord::Base
  has_many   :hire_items



  def sew_name
    (self.name).to_s
  end

  def self.for_query
    s = []
    self.all.each { |sew| s << { :value => sew.name } }
    s
  end
  

  def self.for_select
    s = []
    self.all.each do |sew|
      sname = sew.sew_name
      s << {:name => sname.to_s, :id => sew.id.to_s}
    end
    s
  end
end

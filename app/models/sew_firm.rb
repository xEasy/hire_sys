# == Schema Infoamtion
#
# Table name: sew_firms
#
# id        :integer(4)  not null, primary key
# name      :string


class SewFirm < ActiveRecord::Base
  has_many   :hire_items

  def self.firm_trees
    leafs = []
    records = SewFirm.find(:all,:order => 'name')
    records.each do |s|
      leafs << { "text" => s.name, "id" => "#{s.id}_firm", "leaf" => true }
    end
    leafs
  end
end

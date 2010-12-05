# == Schema Information
#
# Table name: queries
#
#  id         :integer(4)      not null, primary key
#  created_at :datetime
#  updated_at :datetime
#

class Query < ActiveRecord::Base
  # 查询
  # 参数: 
  #   params = { :model_name => x, :ccv => x, :extra_params => x }
  #
  def self.work(params, without_count=false)
    
    extra_params = params[:extra_params]

    name_scope = self.gen_name_scope(params)
    order_and_include = self.gen_order_and_include(extra_params[:sort], extra_params[:dir], params[:model_name]) || { }
   
    rs = eval(name_scope).all(
      :order   => order_and_include[:order  ],
      :joins   => order_and_include[:include], # TODO joins OR include
      :limit   => extra_params[:limit ],
      :offset  => extra_params[:offset]
    )
    without_count ? rs : [rs, eval(name_scope).count]
  end

  # sum && count
  # 同一条件下 sum 或 count 不同的 字段
  # 参数：
  #   params = { :model_name => x, :ccv => x, :fields => ["department/number", "id"] }
  def self.calculate(type, params) 
    name_scope = self.gen_name_scope(params)
    r = { }

    params[:fields].each do |field|
      attr_array = field.gsub("/", ".").split(".")
      attribute  = attr_array.delete_at(-1)

      include_param = self.gen_include(attr_array)
      
      r.update({ field => eval(name_scope).send(type.to_sym, attribute, :include => include_param) })
    end
    r
  end


  def self.gen_name_scope(params)
    model_name   = params[:model_name]
    extra_params = params[:extra_params]
    ccv          = params[:ccv] || []
    
    searchlogic = []
    ccv.each do |item|
      content   = item[:content].gsub('/', '_') 
      condition = item[:condition] 
      value     = self.clear_up_value(item[:value])

      searchlogic.push("#{ content }_#{ condition }(#{ value })")
    end

    searchlogic = searchlogic.join('.') 
    # searchlogic结构：
    #   "id_greater_than(1).usr_name_equals('Tracy').state_cn_like('已批准')"
    
    name_scope = searchlogic.blank? ? model_name : "#{ model_name }.#{ searchlogic }"
  end

  # 功能
  #   >> Query.gen_include(["department"])
  #   => "department"
  #
  #   >> Query.gen_include(["order_item", "order", "customer"])
  #   => { :order_item => { :order => :customer } }
  #
  def self.gen_include(attr_array)
    return nil if(attr_array.blank?)

    include_param = attr_array.delete_at(-1).to_sym

    while(!attr_array.blank?)
      e = attr_array.pop.to_sym
      include_param = { e => include_param }
    end

    include_param
  end

    

  # 功能
  #   >> Query.gen_order_and_include("user_id", "DESC", "Requisition")
  #   => { :order => "requisitions.user_id DESC" }
  #
  #   >> Query.gen_order_and_include("requisition/department.number", "DESC", "Requisition")
  #   => { :order => "departments.number DESC", :include => { "requisition" => "department" } }
  #
  def self.gen_order_and_include(sort, dir, model_name)
    return nil if(sort.nil?)

    attr_array = sort.gsub("/", ".").split(".")
    attribute = attr_array.delete_at(-1)

    return { :order => "#{ model_name.tableize }.#{ attribute } #{ dir }" } if(attr_array.blank?)

    include_param = self.gen_include(attr_array.clone)
    table_name    = attr_array.last.tableize

    { :order => "#{ table_name }.#{ attribute } #{ dir }", :include => include_param }
  end


  # 功能 
  #   >> Query.clear_up_value("跟单")
  #   => "\'跟单\'"
  #
  #   >> Query.clear_up_value("1&2&3")
  #   => "['1', '2', '3']"
  #
  def self.clear_up_value(value)
    #if value.match(/(,)|(，)/)
    #  separator = $1 || $2
    #  values = value.split(separator).collect { |e| e.dump }
    #  return "[ #{ values.join(',') } ]"
    #end

    value.dump
  end
end




class QueryController < ApplicationController

  # POST /query/work
  # 查询操作
  #
  # 参数名称:
  #   model_name  : 查询的model名，如 'requisition'
  #   ccv         : content & condition & value 组成的哈希数组  查询的限制条件
  #   extra_params: dir & sort & offset & limit 等排序分页参数
  #   fields      : provider fields
  #
  # 参数结构:
  #   params = { 
  #     :model_name => 'order', 
  #     :ccv => [
  #       { :content => 'id'                , :condition => 'equals'      , :value = '1' },
  #       { :content => 'requisition/number', :condition => 'greater_than', :value = '2' }
  #     ],
  #     :fields => ['id', 'department/number'] 
  #     :extra_params => { :offset => 'xx', :limit => 'xx', :order => 'xx' }
  #   }
  #
  def work
    rs, count = Query.work({ 
      :model_name   => params[:model_name].camelize,
      :extra_params => params[:extra_params],
      :ccv          => params[:ccv]
    })
    render_json(rs.collect { |r| r.provide(params[:fields]) }, count)
  end

  # POST /query/sum
  # 功能：汇总功能
  def sum
    render_json calculate(:sum)
  end

  # POST /query/count
  # 功能：计数功能
  def count
    render_json calculate(:count)
  end

  # POST /query/all_count
  # 功能：多条件计数
  # 参数：
  #   params = {  
  #     :all_count => [
  #         { :model_name => x1, :ccv => x1, :fields => x1 },
  #         { :model_name => x2, :ccv => x2, :fields => x2 }
  #     ]
  #   };
  #
  def all_count
    rs = []
    params[:all_count].each do |p|
      rs << Query.calculate(:count, { 
        :model_name => p[:model_name].camelize,
        :fields     => p[:fields],
        :ccv        => p[:ccv]
      })
    end

    render_json rs
    # rs结构:
    #   [{ :id => 224, :progress_id => 10 }, { :id => 1 }, { :user_id => 40 }]
  end
  


  # GET /query/for_query
  # 提供数据给前台value的combo
  def for_query
    rs = eval(params[:model_name].camelize).for_query 
    render_json rs
  end


  private
    # 参数结构
    #   params = { 
    #     :model_name => queryOptions.model_name,
    #     :ccv        => queryOptions.ccv,
    #     :fields     => sumFields
    #   }
    #
    def calculate(type)
      Query.calculate(type, { 
        :model_name => params[:model_name].camelize,
        :fields     => params[:fields],
        :ccv        => params[:ccv]
      })
      # 输出结构：
      #   { :id => 224, :progress_id => 10 }
    end
end

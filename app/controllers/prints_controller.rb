class PrintsController < ApplicationController
  def index
  end
  #打印租车单
  def print_hire_orders
    @orders = query_records
    return false unless(@orders)
    
    @items = @orders.collect &:hire_items
  end
   
  #打印退车单
  def print_return_orders
    @orders = query_records
    return false unless(@orders)

    @items = @orders.collect &:return_items
  end

  #打印租车单明细
  def print_hire_items
    @hire_items = query_records
  end

  #打印对车单明细
  def print_return_items
    @return_items = query_records
  end

  #打印租车单表头
  def print_hire_order_titles
    @orders = query_records
  end

  #打印退车单表头
  def print_return_order_titles
    @orders = query_records
  end

  # POST /prints/session
  # 接收参数,并设置session
  def set_session
    session[:query_options] = params[:query_options]
    render_json 'success'
  end

  private 
    def query_records
      query_options = session[:query_options]
      if(!query_options)
        render :text => "对不起,不存在查询参数,请重新点击'打印'按钮"
        return false
      end

      if(query_options[:ids])
        model = eval(query_options[:model_name].camelize)
        rs = model.find(query_options[:ids])
      else
        rs = Query.work({ 
          :model_name   => query_options[:model_name].camelize,
          :extra_params => query_options[:extra_params].delete_if { |k, v| ["limit", "offset"].include? k },
          :ccv          => query_options[:ccv]
        }, true)
      end

      session[:query_options] = nil
      rs
    end
  
end

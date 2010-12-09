class SewHireOrdersController < ApplicationController
  
  filter_access_to [:new, :edit, :dep_approve,:hire_complite, :approve, :cancel , :update_hire_items]
    
  #GET /sew_hire_orders 
  def index
  end
  
  #GET /sew_hire_orders/states_for_query
  def states_for_query
    hs = SewHireOrder.states_for_query
    render_json hs
  end

  #GET /sew_hire_orders/:id/hire_items
  def hire_items
    @items = SewHireOrder.find(params[:id]).hire_items
    @items = @items.collect { |item| item.attributes.merge( :sew_name => item.sew_name, :retain_count => item.retain_count) }
   render :json=> @items.to_json
  end

  # GET  /sew_hire_orders/new
  def new
  end

  #更新租车单项价格&车行&采购备注
  def update_hire_items
    update
  end

  # GET  /sew_hire_orders/:id/edit
  def edit
    @sew_hire_order = SewHireOrder.find(params[:id])
  end

  # GET  /sew_hire_orders/:id/copy
  def copy
    @sew_hire_order = SewHireOrder.find(params[:id])
  end

  # POST /sew_hire_orders
  def create
    ho = SewHireOrder.new(params[:order])
    if ho.save
      render_json "success"
    else
      render_error get_error_msg(ho)
    end
  end

  #更新状态
  #PUT /sew_hire_orders/:id/dep_approve
  def dep_approve
    all_update_state( 'dep_approve!' )
  end
  def approve
    all_update_state( 'approve!' )
  end
  def hire_complite
    all_update_state( 'hire_complite!' )
  end
  def cancel
    all_update_state( 'cancel!' )
  end

  def update
    r = SewHireOrder.find(params[:id])
    if r.update_attributes(params[:order])
      render_json "success"
    else
      render_error get_error_msg(r)
    end
  end

  private
  def all_update_state( action )
    begin
      SewHireOrder.transaction do ||
        orders = SewHireOrder.find( params[:id] )
        orders.each { |o| o.send( action ) }
      end
      render_json "success"
    rescue => e
      render_error e.message
    end
  end
end

class SewReturnOrdersController < ApplicationController
  
  filter_access_to [:new , :approve, :cancel]

  def index
  end

  def create
    orders = SewReturnOrder.new( params[:order] )
    if orders.save
      render_json "success"
    else
      render_error get_error_msg(orders)
    end
  end
  

  #GET sew_return_orders/:id/edit
  def edit
    @sew_return_order = SewReturnOrder.find( params[:id] )
  end

  def update
    r = SewReturnOrder.find( params[:id] )
    if r.update_attributes(params[:order])
        render_json "success"
    else
        render_json get_error_msg(r)
    end
  end

  def new
    @ids = HireItem.can_be_returned_items_id
  end

  def states_for_query
    rs = SewReturnOrder.states_for_query
    render_json rs
  end
  
  #GET sew_return_orders/:id/return_items
  def return_items
    records = SewReturnOrder.find(params[:id]).return_items
    records = records.collect{ |re| re.provide([
        "id",
        "hire_item_id",
        "hire_item/sew_hire_order_id",
        "hire_item/sew/name",
        "hire_item/garage",
        "hire_item/cloth_number",
        "hire_item/actual_hire_date",
        "hire_item/hire_date",
        "hire_item/count",
        "hire_item/retain_count",
        "hire_item/price",
        "hire_item/expect_return_date",
        "total_price",
        "return_count",
        "return_date",
        "remark",
        "state_cn"
    ])
    }
    render :json=> records
  end

  def approve
    all_updata_state("approve!")
  end
  def cancel
    all_updata_state("cancel!")
  end

  private
  def all_updata_state( action )
    begin
      SewReturnOrder.transaction do ||
        orders = SewReturnOrder.find( params[:id] )
        orders.each { |o| o.send( action ) }
      end
      render_json "success"
    rescue => e 
      render_error e.message
    end
  end

end

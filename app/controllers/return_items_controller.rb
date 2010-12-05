class ReturnItemsController < ApplicationController
  
  filter_access_to [:pay, :cancel]
  
  def index
  end

  def states_for_query
      rs = ReturnItem.states_for_query
      render_json rs
  end

  def pay
    all_update_state("pay!")
  end
  def cancel
    all_update_state("cancel!")
  end

  private
  def all_update_state(action)
      begin
        ReturnItem.transaction do
          orders = ReturnItem.find(params[:id])
          orders.each { |o| o.send(action) }
        end
        render_json "success"
      rescue => e
        render_error e.message
      end
  end

end

class HireItemsController < ApplicationController
  def index
  end

  def can_return_hire_items
    @items,count = HireItem.can_be_returned_items( params )
    @items = @items.collect do |item|
        item.attributes.merge( 
            :sew_name => item.sew_name, 
            :retain_count => item.retain_count,
            :hire_id => item.id,
            :hire_count => item.count,
            :state => item.state,
            :hire_person => item.hire_person,
            :hire_number => item.hire_number,
            :department => item.department ) 
        end
    render_json @items,count
  end 

  #PUT /hire_items/update_details.json
  #params 格式  ["items":[{"id": 1, "price": 213,"purchasing_remark": "something_input"},{.....},{....}]]
  def update_details
    items = params[:items]
    items.each do |i| 
      HireItem.update(i[:id],
          :price => i[:price],
          :purchasing_remark => i[:purchasing_remark],
          :garage => i[:garage]) 
    end
    render_json "success"
    rescue => e
      render_error e.message
  end

  def garage_tree
    render :json => HireItem.garage_tree.to_json
  end

end

class PermissionsController < ApplicationController

   filter_access_to :index
  
  # GET /permissions
  def index
    groups = Permission.all(:group => "controller", :order => "id")
    @records = []
    groups.each do |r|
      h = { :controller => r.controller, :controller_zh => r.controller_zh, :actions => [] }

      group = Permission.find_all_by_controller(r.controller)
      group.each do |record|
        h[:actions].push({ :id => record.id, :action => record.action, :action_zh => record.action_zh })
      end
      @records.push h
    end
    # 结构如
    # @rs = [{ 
    #   :controller => 'requisitions', :controller_zh => '请购单', 
    #   :actions => [
    #     { :id => 1,  :action => 'new' , :action_zh => '新增页面' }, 
    #     { :id => 2,  :action => 'copy', :action_zh => '复制页面' }
    #   ]
    # },{ 
    #   :controller => 'requisition_items', :controller_zh => '请购单明细',
    #   :actions => [
    #     { :id => 14, :action => 'view_price'  , :action_zh => '查看单价' }, 
    #     { :id => 15, :action => 'update_count', :action_zh => '编辑数量' }
    #   ]
    # }]
  end
end


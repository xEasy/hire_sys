# == Schema Information
#
# Table name: permissions
#
#  id            :integer(4)      not null, primary key
#  controller    :string(255)
#  controller_zh :string(255)
#  action        :string(255)
#  action_zh     :string(255)
#  created_at    :datetime
#  updated_at    :datetime
#



class Permission < ActiveRecord::Base
 
  AuthRulesPath = File.join('config', 'authorization_rules.rb')

  Records = [{
    :controller => 'sew_hire_orders', :controller_zh => '租车单',
    :actions => [
      { :action => 'new',    :action_zh => '新增租车单' },
      { :action => 'edit',   :action_zh => '编辑租车单' },
      { :action => 'dep_approve', :action_zh => '主管批准' },
      { :action => 'approve',    :action_zh => '采购批准' },
      { :action => 'hire_complite', :action_zh => '完成租车' },
      { :action => 'update_actual_hire_date', :action_zh => '填写实际租车日期' },
      { :action => 'cancel',     :action_zh => '取消租车单' },
      { :action => 'update_hire_items',  :action_zh => '添加价格，车行' },
      { :action => 'view_all',          :action_zh => '查看所有单据' },
      { :action => 'view_price',        :action_zh => '查看价格' },
      { :action => 'view_garage',       :action_zh => '查看车行' }
    ]
    
  },{
    :controller => 'sew_return_orders', :controller_zh => '退车单',
    :actions => [
      { :action => 'new',    :action_zh => '新增退车单' },
      { :action => 'approve',  :action_zh => '批准退车' },
      { :action => 'cancel',   :action_zh => '取消退车' },
      { :action => 'view_price', :action_zh => '查看单价' },
      { :action => 'view_pay_state', :action_zh => '查看付款状态' },
      { :action => 'view_total',     :action_zh => '查看总价' },
      { :action => 'view_garage', :action_zh => '查看车行' },
      { :action => 'view_all', :action_zh => '查看所有单据' }
    ]
  },{
    :controller => 'hire_items',  :controller_zh => '租车明细',
    :actions => [
      { :action => 'view_price',  :action_zh => '查看单价' },
      { :action => 'view_garage', :action_zh => '查看车行' },
      { :action => 'view_p_remark', :action_zh => '查看采购备注' }
    ]
  },{
    :controller => 'return_items', :controller_zh => '退车明细', 
    :actions => [
      { :action => 'view_price',  :action_zh => '查看单价' },
      { :action => 'view_garage', :action_zh => '查看车行' },
      { :action => 'view_total', :action_zh => '查看汇总总价' },
      { :action => 'pay',         :action_zh => '付款' },
      { :action => 'cancel',      :action_zh => '取消付款' },
      { :action => 'view_total_price', :action_zh => '查看总价' }
    ]
  },{  
    :controller => 'users', :controller_zh => '用户', 
    :actions => [
      { :action => 'index'          , :action_zh => '进入用户列表' },
      { :action => 'new'            , :action_zh => '进入新增页面'}, 
      { :action => 'edit'           , :action_zh => '进入编辑页面'},
      { :action => 'create'         , :action_zh => '新增'        },
      { :action => 'update'         , :action_zh => '编辑'        },
      { :action => 'destroy'        , :action_zh => '删除'        }
    ]
  },{ 
    :controller => 'roles', :controller_zh => '用户组', 
    :actions => [
      { :action => 'index'          , :action_zh => '进入用户组列表' },
      { :action => 'new'            , :action_zh => '进入新增页面'}, 
      { :action => 'edit'           , :action_zh => '进入编辑页面'},
      { :action => 'create'         , :action_zh => '新增'        },
      { :action => 'update'         , :action_zh => '编辑'        },
      { :action => 'destroy'        , :action_zh => '删除'        },
      { :action => 'update_permission_ids' , :action_zh => '编辑权限' }
    ]
  },{
    :controller => 'permissions', :controller_zh => '权限',
    :actions => [
      { :action => 'index', :action_zh => '进入列表' }
    ]
  },{ 
    :controller => 'prints', :controller_zh => '打印',
    :actions => [
      { :action => 'index', :action_zh => '打印操作' }
    ]
  }]
end

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
      { :id => 1, :action => 'new',    :action_zh => '新增租车单' },
      { :id => 2, :action => 'edit',   :action_zh => '编辑租车单' },
      { :id => 3, :action => 'dep_approve', :action_zh => '主管批准' },
      { :id => 4, :action => 'approve',    :action_zh => '采购批准' },
      { :id => 42,:action => 'hire_complite', :action_zh => '完成租车' },
      { :id => 5, :action => 'cancel',     :action_zh => '取消租车单' },
      { :id => 6, :action => 'update_hire_items',  :action_zh => '添加价格，车行' },
      { :id => 7, :action => 'view_all',          :action_zh => '查看所有单据' },
      { :id => 8, :action => 'view_price',        :action_zh => '查看价格' },
      { :id => 9, :action => 'view_garage',       :action_zh => '查看车行' }
    ]
    
  },{
    :controller => 'sew_return_orders', :controller_zh => '退车单',
    :actions => [
      { :id => 10,  :action => 'new',    :action_zh => '新增退车单' },
      { :id => 11,  :action => 'approve',  :action_zh => '批准退车' },
      { :id => 12, :action => 'cancel',   :action_zh => '取消退车' },
      { :id => 13, :action => 'view_price', :action_zh => '查看单价' },
      { :id => 14, :action => 'view_pay_state', :action_zh => '查看付款状态' },
      { :id => 15, :action => 'view_total',     :action_zh => '查看总价' },
      { :id => 16, :action => 'view_garage', :action_zh => '查看车行' },
      { :id => 17, :action => 'view_all', :action_zh => '查看所有单据' }
    ]
  },{
    :controller => 'hire_items',  :controller_zh => '租车明细',
    :actions => [
      { :id => 18, :action => 'view_price',  :action_zh => '查看单价' },
      { :id => 19, :action => 'view_garage', :action_zh => '查看车行' },
      { :id => 20, :action => 'view_p_remark', :action_zh => '查看采购备注' }
    ]
  },{
    :controller => 'return_items', :controller_zh => '退车明细', 
    :actions => [
      { :id => 21, :action => 'view_price',  :action_zh => '查看单价' },
      { :id => 22, :action => 'view_garage', :action_zh => '查看车行' },
      { :id => 23, :action => 'view_total', :action_zh => '查看汇总总价' },
      { :id => 24, :action => 'pay',         :action_zh => '付款' },
      { :id => 25, :action => 'cancel',      :action_zh => '取消付款' },
      { :id => 26, :action => 'view_total_price', :action_zh => '查看总价' }
    ]
  },{  
    :controller => 'users', :controller_zh => '用户', 
    :actions => [
      { :id => 37,  :action => 'index'          , :action_zh => '进入用户列表' },
      { :id => 27,  :action => 'new'            , :action_zh => '进入新增页面'}, 
      { :id => 28,  :action => 'edit'           , :action_zh => '进入编辑页面'},
      { :id => 29,  :action => 'create'         , :action_zh => '新增'        },
      { :id => 30,  :action => 'update'         , :action_zh => '编辑'        },
      { :id => 31,  :action => 'destroy'        , :action_zh => '删除'        }
    ]
  },{ 
    :controller => 'roles', :controller_zh => '用户组', 
    :actions => [
      { :id => 38,  :action => 'index'          , :action_zh => '进入用户组列表' },
      { :id => 32,  :action => 'new'            , :action_zh => '进入新增页面'}, 
      { :id => 41,  :action => 'edit'           , :action_zh => '进入编辑页面'},
      { :id => 33,  :action => 'create'         , :action_zh => '新增'        },
      { :id => 34,  :action => 'update'         , :action_zh => '编辑'        },
      { :id => 35,  :action => 'destroy'        , :action_zh => '删除'        },
      { :id => 36,  :action => 'update_permission_ids' , :action_zh => '编辑权限' }
    ]
  },{
    :controller => 'permissions', :controller_zh => '权限',
    :actions => [
      { :id => 39, :action => 'index', :action_zh => '进入列表' }
    ]
  },{ 
    :controller => 'prints', :controller_zh => '打印',
    :actions => [
      { :id => 40, :action => 'index', :action_zh => '打印操作' }
    ]
  }]
end

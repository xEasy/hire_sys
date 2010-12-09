ActionController::Routing::Routes.draw do |map|

  map.resources :permissions

  map.resource :session

  map.resources :sessions

  map.resources :print,
    :collection => {
     :set_session => :post,
      :print_hire_orders => :get,
      :print_return_orders => :get,
      :print_hire_items => :get,
      :print_return_items => :get,
      :print_hire_order_titles => :get,
      :print_return_order_titles => :get
    }

  map.resources :hire_items,
    :collection => {
      :update_details => :put,
      :garage_tree => :post,
      :can_return_hire_items => :get
    }

  map.resources :return_items,
  :collection => {
    :states_for_query => :get,
    :pay => :put,
    :cancel => :put
  }
  

  map.resources :sew_return_orders,
    :member => {
      :return_items => :get,
    },
    :collection => {
      :approve => :put,
      :states_for_query => :get,
      :cancel => :put
    }

  map.resources :sew_hire_orders,
    :member => {
      :hire_items => :get,
      :copy => :get
    },
    :collection => {
      :dep_approve => :put,
      :approve => :put,
      :cancel => :put,
      :hire_complite => :put,
      :states_for_query => :get
    }
    

  map.resources :sew,
   :collection => {
     :for_select => :get
   }

  map.resources :users,
    :collection => {
      :edit_current_user => :get
    },
    :member => {
      :update_current_user => :put
    }

  map.resources :departments,
    :collection => {
      :for_select => :get
    }

  map.resources :roles, 
    :collection => { 
      :for_ext_select => :get
    }, 
    :member => { 
      :permission_ids => :get,
      :update_permission_ids => :put
    }

  map.resources :sew_firms,
    :collection => {
 #     :firm_tree => :post
    }

  #sews == sew.....
  map.connect '/sews.json',
      :conditions => { :method => :get },
      :controller => "sew",
      :action     => "sew_json"
  map.connect '/sews.json',
      :conditions => { :method => :post },
      :controller => "sew",
      :action     => "create"
  map.connect '/sews/:id.json',
      :conditions => { :method => :put },
      :controller => "sew",
      :action     => "update"
  map.connect '/sews/:id.json',
      :conditions => { :method => :delete },
      :controller => "sew",
      :action     => "destroy"

  map.logout '/logout', :controller => 'sessions', :action => 'destroy'
  map.login '/login', :controller => 'sessions', :action => 'new'
  map.register '/register', :controller => 'users', :action => 'create'
  map.signup '/signup', :controller => 'users', :action => 'new'
  
      
  map.connect '', :controller => 'sew_hire_orders', :action => 'index'
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'
end

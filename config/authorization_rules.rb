authorization do

  role :admin do
    has_permission_on :hire_items, :to => [:view_price,:view_garage,:view_p_remark]
    has_permission_on :permissions, :to => [:index]
    has_permission_on :prints, :to => [:index]
    has_permission_on :return_items, :to => [:view_price,:view_garage,:view_total,:pay,:cancel,:view_total_price]
    has_permission_on :roles, :to => [:index,:new,:edit,:create,:update,:destroy,:update_permission_ids]
    has_permission_on :sew_hire_orders, :to => [:new,:edit,:dep_approve,:approve,:hire_complite,:update_actual_hire_date,:cancel,:update_hire_items,:view_all,:view_price,:view_garage]
    has_permission_on :sew_return_orders, :to => [:new,:approve,:cancel,:view_price,:view_pay_state,:view_total,:view_garage,:view_all]
    has_permission_on :users, :to => [:index,:new,:edit,:create,:update,:destroy]
  end

  role :manager do
    has_permission_on :hire_items, :to => [:view_price,:view_garage,:view_p_remark]
    has_permission_on :permissions, :to => [:index]
    has_permission_on :prints, :to => [:index]
    has_permission_on :return_items, :to => [:view_price,:view_garage,:view_total,:pay,:cancel,:view_total_price]
    has_permission_on :roles, :to => [:index,:new,:edit,:create,:update,:destroy,:update_permission_ids]
    has_permission_on :sew_hire_orders, :to => [:view_garage]
    has_permission_on :sew_return_orders, :to => [:new,:approve,:cancel,:view_price,:view_pay_state,:view_total,:view_garage,:view_all]
    has_permission_on :users, :to => [:index,:new,:edit,:create,:update,:destroy]
  end

  role :boss do
    has_permission_on :hire_items, :to => [:view_price,:view_garage,:view_p_remark]
    has_permission_on :permissions, :to => [:index]
    has_permission_on :return_items, :to => [:view_price,:view_garage,:view_total,:pay,:cancel,:view_total_price]
    has_permission_on :roles, :to => [:index,:new,:edit,:create,:update,:destroy,:update_permission_ids]
    has_permission_on :sew_hire_orders, :to => [:new,:edit,:dep_approve,:approve,:hire_complite,:update_actual_hire_date,:cancel,:update_hire_items,:view_all,:view_price,:view_garage]
    has_permission_on :sew_return_orders, :to => [:new,:approve,:cancel,:view_price,:view_pay_state,:view_total,:view_garage,:view_all]
    has_permission_on :users, :to => [:index,:new,:edit,:create,:update,:destroy]
  end

end

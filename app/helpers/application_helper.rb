# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper

  def roles_for_select
    Role.for_select 
  end

  def departments_for_select
    Department.for_select
  end

  # { :users=>[:create, :destroy, :edit, :update, :new], :requisitions=>[:update_state, :create, :update_progress]}
  def privileges_of_current_user
    result = {}
    auth_rules = Authorization::Engine.instance.auth_rules
    rules = auth_rules.select { |r| r.role == current_user.role_symbol }
    rules.each { |r| result.update(r.contexts.first => r.privileges.to_a) }
    result
  end

  def blank(n)
    "&nbsp;" * n
  end
  
end


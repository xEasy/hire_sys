class RolesController < ApplicationController
  filter_access_to [:new, :edit, :create, :update, :destroy, :update_permission_ids, :index]

  # GET /roles
  def index
    @rs = Role.all(:order => "id desc")
      respond_to do |format|
        format.html  
        format.json  { render_json @rs }
    end
  end

  # PUT /roles/:id
  def update
    r = Role.find(params[:id])
    if r.update_attributes(params[:role])
      render_json "success"
    else
      render_error get_error_msg(r)
    end
  end

  # POST /roles
  def create
    r = Role.new(params[:role])
    if r.save
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end

  # DELETE /roles/:id
  def destroy
    r = Role.find(params[:id])
    if( r.destroy )
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end


  # GET /roles/for_ext_select
  def for_ext_select
    render_json Role.for_ext_select
  end

  def for_select
    Role.for_select
  end

  # GET /roles/:id/permission_ids
  def permission_ids
    render_json Role.find(params[:id]).permission_ids
  end

  # PUT /roles/:id/update_permission_ids
  def update_permission_ids
    role = Role.find(params[:id])
    if role.update_attributes(:permission_ids => params[:ids])
      render_json 'success'
    else
      render_json get_error_msg(role)
    end
  end

end


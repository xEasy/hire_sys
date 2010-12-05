class UsersController < ApplicationController

  filter_access_to [:new, :edit, :create, :update, :destroy, :index]

  def index
    s = "id, login, role_id, name, department_id"
    @users = User.all(:select => s, :order => 'role_id').collect { |user| user.attributes.update(
      :role_title => user.role.title,
      :department_name => user.department.name
    ) }

    respond_to do |format|
      format.html
      format.json { render_json @users }
    end
  end

  def new
    @user = User.new
  end


  def create
    @user = User.new(params[:user])
    success = @user && @user.save
    if success && @user.errors.empty?
      redirect_back_or_default('/users')
    else
      flash[:error] = "对不起，添加用户操作失败!"
      render :action => 'new'
    end
  end 

  # 编辑当前用户
  # 渲染edit.html.erb
  def edit_current_user
    @user = current_user
    @action_cn = "edit_current_user"
    render :action => 'edit'
  end

  # 编辑任意用户
  def edit
    @user = User.find(params[:id])
    @action_cn = "edit"
  end
  
  # /users/:id/update_current_user
  # 对此函数的请求交由update处理，此函数之所以存在是因为只有足够权限的用户才能请求update，
  #   而所有用户的可以编辑自己的个人信息
  def update_current_user
    update
  end

  def update
    @user = User.find(params[:id])

    if @user.update_attributes(params[:user])
      flash[:notice] = (params[:type] == 'reset_secret') ? "" : "修改用户操作成功!"
    else
      # flash[:error ] = "对不起，修改用户操作失败!"
      flash[:error] = get_error_msg(@user)
    end

    redirect_to :back
  end

  # DELETE /users/:id
  def destroy
    @user = User.find(params[:id])
    if @user.destroy
      render_json "success"
    else
      render_error get_error_msg(@user)
    end
  end
end


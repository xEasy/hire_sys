class DepartmentsController < ApplicationController
  def index
    @rs = Department.all
      respond_to do |format|
        format.html
        format.json { render_json @rs }
     end
  end
  # PUT /departments/:id
  def update
    r = Department.find(params[:id])
    if r.update_attributes(params[:department])
      render_json "success"
    else
      render_error get_error_msg(r)
    end
  end

  # POST /departments
  def create
    r = Department.new(params[:department])
    if r.save
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end

  # DELETE /departments/:id
  def destroy
    r = Department.find(params[:id])
    if( r.destroy )
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end
  

  # GET /departments/for_select
  def for_select
    render_json Department.for_select
  end
end

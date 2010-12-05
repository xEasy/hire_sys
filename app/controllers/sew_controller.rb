class SewController < ApplicationController
  def index
    @sews = Sew.all
      respond_to do |format|
        format.html
        format.json { render_json @sews }
      end
  end

  def sew_json
    @sews = Sew.all
    render_json @sews
  end

  # PUT /sews/:id
  def update
    r = Sew.find(params[:id])
    if r.update_attributes(params[:sew])
      render_json "success"
    else
      render_error get_error_msg(r)
    end
  end

  # POST /sews
  def create
    r = Sew.new(params[:sew])
    if r.save
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end

  # DELETE /sews/:id
  def destroy
    r = Sew.find(params[:id])
    if( r.destroy )
      render_json "success"  
    else
      render_error get_error_msg(r)
    end
  end
  

  def for_select
    render_json Sew.for_select
  end

end

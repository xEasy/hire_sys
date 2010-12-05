class SewFirmsController < ApplicationController
  def index
  end

  def firm_tree
    render :json => SewFirm.firm_trees.to_json
  end

end

# -*- encoding : utf-8 -*-
# Provider
module Provider

  def provide!(complex_attrs)
    provide(complex_attrs, true)
  end

  # complex_attrs #=> ["progress/number", "user_name", "user/name"]
  def provide(complex_attrs, raise_exception=false)
    r = {}
    complex_attrs.each do |ac|
      r.update( ac => work(ac, raise_exception) )
    end
    r
  end
  
  def work(ac, raise_exception=false)
    eval("self.#{ ac.gsub("/", ".") }")

  rescue NoMethodError => e
    raise "#{ self.class.class_name } ID:#{ self.id } provide'#{ ac }'时抛出异常。异常信息：#{ e.message }" if(raise_exception)
    "&nbsp"
  end  
end



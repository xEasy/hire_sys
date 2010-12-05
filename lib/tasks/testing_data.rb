class TD < Thor
  desc "testing_data", "生成测试数据"
  def testing_data
    puts "------重建数据库------"
    %x{ rake db:reset }
    puts "------生成测试数据----"

    load_env

    Department.create(:name => "IE")
    Department.create(:name => "老板")
    Department.create(:name => "采购")
    Department.create(:name => "仓库")
    Department.create(:name => "跟单")
    Department.create(:name => "板房")
    Department.create(:name => "船务")

    Sew.create(:name => "缝纫机")
    Sew.create(:name => "高速衣车")
    Sew.create(:name => "全自动衣车")
    


    User.create(:password_confirmation =>"hzuhzu", :password => "hzuhzu", :login => "admin", :email => "admin@gmail.com", 
      :role_id => 1, :name => '管理员', :department_id => 1)  # important!

    User.create(:password_confirmation =>"hzuhzu", :password => "hzuhzu", :login => "elky"    , :email => "e@gmail.com", 
      :role_id => 2, :name => 'Elky', :department_id => 2)
    User.create(:password_confirmation =>"hzuhzu", :password => "hzuhzu", :login => "lucy", :email => "em@gmail.com", 
      :role_id => 3, :name => 'Lucy', :department_id => 3)


    ActiveRecord::Base.connection.execute('truncate permissions;')
    Permission::Records.each do |r|
      r[:actions].each do |a|
        Permission.create(a.merge :controller => r[:controller], :controller_zh => r[:controller_zh])
      end
    end

    Role.create(:title => "admin"   , :permission_ids => (1..41).to_a)
    Role.create(:title => "manager"   , :permission_ids => (1..41).to_a)
    Role.create(:title => "boss"   , :permission_ids => (1..41).to_a)
    
    
    puts "------完成------------"
  end

  private
    def load_env
      require 'config/environment'
    end
end


# == Schema Information
#
# Table name: roles
#
#  id             :integer(4)      not null, primary key
#  permission_ids :text
#  created_at     :datetime
#  updated_at     :datetime
#  title          :string(255)
#  active         :boolean(1)      default(TRUE)
#
# Associations:
#  users          :has_many        [User(role_id)] 
#

class Role < ActiveRecord::Base
  acts_as_active(:show_inactive_in_associations => true)

  has_many :users

  validates_presence_of :title, :message => '编号不能为空' 
  
  # 储存权限的数组
  serialize :permission_ids

  before_create   :set_permission_ids
  before_save     :validate_title
  before_save     :add_default_permission_id
  after_save      :update_auth_rules
  before_destroy  :validate_user

  before_update  :validate_base_setting

  AuthRulesPath = File.join(RAILS_ROOT, 'config', 'authorization_rules.rb')

  def self.for_select
    r = []
    self.all.each { |role| r << [role.title, role.id] }
    r
    # [ ["admin", 1], ["boss", 2] ]
  end

  def self.for_ext_select
    r = []
    self.all.each { |role| r << { :value => role.title, :id => role.id } }
    r
    # [{ :value => 'x', :id => 'x' }]
  end

  private
    def validate_title
      unless self.title =~ /^([a-z]|[A-Z])+$/
        self.errors.add('title', '用户组编号必须由纯字母组成')
        return false
      end
      true
    end

    def set_permission_ids
      self.permission_ids ||= []
    end

    # 给管理员添加 编辑权限
    def add_default_permission_id
      if(self.title == 'admin')
        default_permission_id = Permission.find_by_controller_and_action('roles', 'update_permission_ids').id;
        self.permission_ids = self.permission_ids | [default_permission_id]
      end
    end

    def update_auth_rules
      roles = Role.all
      controllers = Permission.all(:group => "controller").collect &:controller
      
      f = "authorization do\n\n"

      roles.each do |role|

        r = "  role :#{ role.title } do\n"

        controllers.each do |c|
          actions = Permission.all(:conditions => { :id => role.permission_ids, :controller => c }).collect &:action
          unless actions.blank?
            str = actions.join(',:') 
            str = ":#{ str }" 

            c = "    has_permission_on :#{ c.to_sym }, :to => [#{ str }]\n"

            r << c
          end
        end

        r << "  end\n\n"

        f << r
      end
      f << "end\n"

      file = File.open(AuthRulesPath, "w")
      file.puts f
      file.close  

  #    Authorization::Engine.need_load_auth_rules = true
    end

    def validate_user
      if(self.users.count != 0)
        self.errors.add("user", "此用户组用户数量不为0，不能删除")
        return false
      end
    end

    def validate_base_setting
      # ID:1 #=> { :title => 'admin' }
      if(self.id == 1 && self.title_changed?)
        self.errors.add("id", "不能修改的基础数据")
        return false
      end
    end
end


# == Schema Information
#
# Table name: users
#
#  id                        :integer(4)      not null, primary key
#  login                     :string(40)
#  name                      :string(100)     default("")
#  email                     :string(100)
#  crypted_password          :string(40)
#  salt                      :string(40)
#  created_at                :datetime
#  updated_at                :datetime
#  remember_token            :string(40)
#  remember_token_expires_at :datetime
#  role_id                   :integer(4)
#  active                    :boolean(1)      default(TRUE)
#  department_id             :integer(4)
#
#

require 'digest/sha1'

class User < ActiveRecord::Base

  include Authentication
  include Authentication::ByPassword
  include Authentication::ByCookieToken

  acts_as_active(:show_inactive_in_associations => true)

  validates_presence_of   :login, :message => '用户名不能为空'
  validates_uniqueness_of :login, :message => "用户名已存在"
  validates_length_of     :login, :within => 3..40, :message => '用户名长度应在3～40之间'
  validates_format_of     :login, :with => Authentication.login_regex, :message => Authentication.bad_login_message
  validates_presence_of   :password, :if => lambda { |r| r.new_record? || r.password }, :message=>'密码不能为空'
  validates_presence_of   :name, :message => '姓名不能为空'
  validates_presence_of   :role_id, :message => '用户组不能为空'
  validates_presence_of   :department_id, :message => '部门不能为空'

  attr_accessible :login, :password, :password_confirmation, :role_id, :name, :department_id

  belongs_to :role
  belongs_to :department

  before_destroy :validate_admin
  before_create  :set_role

  def self.authenticate(login, password)
    return nil if login.blank? || password.blank?
    u = find_by_login(login.downcase) # need to get the salt
    u && u.authenticated?(password) ? u : nil
  end

  def self.for_query
    rs = []
    self.all.each { |user| rs << { :value => user.name } }
    rs
  end

  def login=(value)
    write_attribute :login, (value ? value.downcase : nil)
  end

  def email=(value)
    write_attribute :email, (value ? value.downcase : nil)
  end

  def role_symbols
    [role_symbol]
  end

  def role_symbol
    role.title.to_sym
  end

  private
    def validate_admin
      if(self.role_symbol == :admin)
        self.errors.add("role", "不能删除管理员")
        return false
      end
    end

    def set_role 
      self.role_id ||= Role.first.id
    end
end


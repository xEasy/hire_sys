# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20110216131511) do

  create_table "departments", :force => true do |t|
    t.string "name"
  end

  create_table "hire_items", :force => true do |t|
    t.integer  "sew_id"
    t.integer  "count"
    t.string   "cloth_number"
    t.date     "hire_date"
    t.date     "expect_return_date"
    t.string   "dep_remark"
    t.integer  "price"
    t.string   "purchasing_remark"
    t.integer  "sew_hire_order_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "garage"
    t.integer  "return_items",       :default => 0
    t.integer  "return_items_count", :default => 0
    t.date     "actual_hire_date"
  end

  create_table "operation_records", :force => true do |t|
    t.date     "op_date"
    t.integer  "user_id"
    t.string   "op_type"
    t.integer  "order_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "permissions", :force => true do |t|
    t.string   "controller"
    t.string   "controller_zh"
    t.string   "action"
    t.string   "action_zh"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "return_items", :force => true do |t|
    t.integer  "hire_item_id"
    t.integer  "sew_return_order_id"
    t.integer  "count"
    t.date     "return_date"
    t.string   "remark"
    t.string   "pay_state"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "state_cn"
    t.integer  "total"
  end

  create_table "roles", :force => true do |t|
    t.text     "permission_ids"
    t.string   "title"
    t.boolean  "active"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "sew_hire_orders", :force => true do |t|
    t.string   "number",              :limit => 40
    t.date     "create_date"
    t.string   "hire_person"
    t.integer  "department_id"
    t.string   "state"
    t.string   "remark"
    t.integer  "operation_record_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "state_cn"
    t.string   "create_time"
    t.date     "actual_hire_date"
  end

  create_table "sew_return_orders", :force => true do |t|
    t.string   "number"
    t.date     "create_date"
    t.integer  "department_id"
    t.string   "return_person"
    t.string   "sew_dealer"
    t.string   "state"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remark"
    t.string   "state_cn"
    t.string   "create_time"
  end

  create_table "sews", :force => true do |t|
    t.string "name"
    t.string "sew_type"
  end

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
    t.integer  "role_id"
    t.boolean  "active"
    t.integer  "department_id"
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

end

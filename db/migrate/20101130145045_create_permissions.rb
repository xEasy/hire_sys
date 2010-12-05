class CreatePermissions < ActiveRecord::Migration
  def self.up
    create_table :permissions do |t|
      t.string :controller
      t.string :controller_zh
      t.string :action
      t.string :action_zh

      t.timestamps
    end
  end

  def self.down
    drop_table :permissions
  end
end

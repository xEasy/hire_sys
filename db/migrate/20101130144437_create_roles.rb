class CreateRoles < ActiveRecord::Migration
  def self.up
    create_table :roles do |t|
      t.text :permission_ids
      t.string :title
      t.boolean :active

      t.timestamps
    end
  end

  def self.down
    drop_table :roles
  end
end

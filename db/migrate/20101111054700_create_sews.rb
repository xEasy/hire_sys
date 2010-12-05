class CreateSews < ActiveRecord::Migration
  def self.up
    create_table :sews do |t|
      t.column :name,   :string
      t.column :sew_type, :string

    end
  end

  def self.down
    drop_table :sews
  end
end

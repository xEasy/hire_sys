# Include hook code here
# include 'lib/provider'
ActiveRecord::Base.send(:include, Provider)

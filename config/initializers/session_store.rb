# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_hire_session',
  :secret      => 'c3c5bf5d4313f2a09b195ebbf82534050bc7bb18336fddd7e6ba4b2cce51151d8d10221ebcad971cbb46a5b59181453f7aa6a21532e121823045a010a7a179eb'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store

-- Add 'admin' to users role enum
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('decorator', 'renter', 'admin'));

-- Update admin user role (run after signing up with your admin email)
-- Replace the email below with your actual admin email
UPDATE users SET role = 'admin' WHERE email = 'admin@propflow.ma';

-- If your admin email is different, run:
-- UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';

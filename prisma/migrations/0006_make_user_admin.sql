-- Grant admin role to the first user (typically the site creator)
UPDATE user SET role = 'admin' WHERE email = 'sps@just-be.dev';

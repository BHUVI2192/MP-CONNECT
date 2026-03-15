-- Fix PA and MP roles for test users in Supabase
-- Replace the email addresses with your actual test user emails if different


-- Update PA role
update profiles set role = 'PA'
where id in (select id from auth.users where email = 'pa1@example.com');

-- Update MP role
update profiles set role = 'MP'
where id in (select id from auth.users where email = 'mp1@example.com');


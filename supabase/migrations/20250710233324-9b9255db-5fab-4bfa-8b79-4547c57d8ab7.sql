-- Update test user passwords to use the secure passwords
-- Password123! hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- AdminPass456! hash: $2a$10$8K1p/a9Ti6.LMxIBjhppUOaOqFhF5o5UiHKqYTN7TSCv.KG8ap/XO

UPDATE auth.users SET encrypted_password = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email IN ('learner@testcompany.com', 'sales@easeworks.com', 'staffing@easeworks.com');

UPDATE auth.users SET encrypted_password = '$2a$10$8K1p/a9Ti6.LMxIBjhppUOaOqFhF5o5UiHKqYTN7TSCv.KG8ap/XO'
WHERE email IN ('admin@testcompany.com', 'newadmin@testcompany.com');
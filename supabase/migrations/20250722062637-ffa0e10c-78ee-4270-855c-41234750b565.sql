-- Fix client@testcompany.com password hash to match working test users
UPDATE auth.users 
SET encrypted_password = '$2a$10$1Ao7GQBSCYBJWuasGgPOWOpcV1FFipvlCZmlMUH402vQHyi5dbDB2'
WHERE email = 'client@testcompany.com';
-- Add test user to the database
INSERT INTO "User" (email, name, "passwordHash", role, status)
VALUES (
  'test@zolve.com',
  'Test User',
  '$2b$12$xNtw4XSVTBpKeLcmwGxpIe0Rqrq.sIuw0RVZO11i5MIczwg5Q0vkq',
  'COUNSELOR',
  'ACTIVE'
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = '$2b$12$xNtw4XSVTBpKeLcmwGxpIe0Rqrq.sIuw0RVZO11i5MIczwg5Q0vkq'
RETURNING id, email, name, role;

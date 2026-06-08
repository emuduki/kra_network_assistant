$sql = @'
UPDATE users SET password_hash = '$2b$10$FC2TndMxhvD0X/N6GZTWqeHkYj6tX4V3JxDweHgTNHF4wWZNmRQji' WHERE email IN ('kariuki@kra.go.ke','omondi@kra.go.ke','wangari@kra.go.ke');
SELECT id, email, password_hash FROM users ORDER BY id;
'@

$sql | docker compose exec -T db psql -U kra_user -d kra_network

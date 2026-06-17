#!/bin/bash

# Generate BCrypt hash for Test1234
# Using online tool or dotnet

echo "Password: Test1234"
echo "Hash will be generated via API test"

# Test with actual registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "hashtest@zekids.com", "password": "Test1234"}'

echo ""
echo "Check database for the hash:"
echo "docker exec zekids-postgres psql -U postgres -d zekids_dev -c \"SELECT \\\"PasswordHash\\\" FROM \\\"Users\\\" WHERE \\\"Email\\\" = 'hashtest@zekids.com';\""

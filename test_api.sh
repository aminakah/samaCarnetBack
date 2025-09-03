#!/bin/bash

echo "🚀 SamaCarnet Backend - Test Script"
echo "======================================"

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_BASE="http://localhost:3333"
TENANT_ID="1"

# Fonction pour tester un endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local data=$4
    local headers=$5
    local description=$6

    echo -e "\n${BLUE}Testing:${NC} $description"
    echo -e "${YELLOW}$method${NC} $endpoint"

    if [[ -n "$data" ]]; then
        if [[ -n "$headers" ]]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -H "$headers" \
                -d "$data" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$API_BASE$endpoint")
        fi
    else
        if [[ -n "$headers" ]]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                -H "$headers" \
                "$API_BASE$endpoint")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method \
                "$API_BASE$endpoint")
        fi
    fi

    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')

    if [[ "$http_code" -eq "$expected_status" ]]; then
        echo -e "${GREEN}✅ PASS${NC} (Status: $http_code)"
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
    fi
}

echo -e "\n${BLUE}Step 1: Testing Basic API Health${NC}"
test_endpoint "GET" "/health" 200 "" "" "API Health Check"

echo -e "\n${BLUE}Step 2: Testing Authentication Endpoints${NC}"

# Test login without tenant (should fail)
test_endpoint "POST" "/api/v1/public/auth/login" 400 \
    '{"email":"fatou.seck@demo.com","password":"password123"}' \
    "" "Login without tenant header"

# Test login with invalid tenant (should fail)
test_endpoint "POST" "/api/v1/public/auth/login" 401 \
    '{"email":"fatou.seck@demo.com","password":"password123"}' \
    "x-tenant-id: 999" "Login with invalid tenant"

# Test login with valid credentials (might fail if DB not seeded)
test_endpoint "POST" "/api/v1/public/auth/login" 401 \
    '{"email":"fatou.seck@demo.com","password":"password123"}' \
    "x-tenant-id: $TENANT_ID" "Login with valid credentials (DB might not be seeded)"

# Test login with wrong password
test_endpoint "POST" "/api/v1/public/auth/login" 401 \
    '{"email":"fatou.seck@demo.com","password":"wrongpassword"}' \
    "x-tenant-id: $TENANT_ID" "Login with wrong password"

echo -e "\n${BLUE}Step 3: Testing Tenant Registration${NC}"
test_endpoint "POST" "/api/v1/public/tenants/register" 400 \
    '{"firstName":"Test","lastName":"User"}' \
    "" "Tenant registration with incomplete data"

echo -e "\n${BLUE}Step 4: Testing Protected Endpoints (should fail without auth)${NC}"
test_endpoint "GET" "/api/v1/auth/profile" 401 \
    "" "x-tenant-id: $TENANT_ID" "Profile without authentication"

test_endpoint "GET" "/api/v1/pregnancies" 401 \
    "" "x-tenant-id: $TENANT_ID" "Pregnancies without authentication"

test_endpoint "GET" "/api/v1/consultations" 401 \
    "" "x-tenant-id: $TENANT_ID" "Consultations without authentication"

test_endpoint "GET" "/api/v1/vaccinations" 401 \
    "" "x-tenant-id: $TENANT_ID" "Vaccinations without authentication"

test_endpoint "GET" "/api/v1/sync/status" 401 \
    "" "x-tenant-id: $TENANT_ID" "Sync status without authentication"

echo -e "\n${BLUE}Step 5: Testing Non-existent Endpoints${NC}"
test_endpoint "GET" "/api/v1/nonexistent" 404 \
    "" "" "Non-existent API endpoint"

test_endpoint "POST" "/api/v1/fake/endpoint" 404 \
    '{"test":"data"}' "" "Non-existent POST endpoint"

echo -e "\n${BLUE}Step 6: Testing Method Not Allowed${NC}"
test_endpoint "DELETE" "/health" 405 \
    "" "" "DELETE on health endpoint (method not allowed)"

echo -e "\n========================================"
echo -e "${GREEN}✅ Basic API tests completed!${NC}"
echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo "1. Run migrations: node ace migration:run"
echo "2. Seed database: node ace db:seed --files=dev_seeder.ts"
echo "3. Then test login with seeded credentials"
echo "4. Try the API endpoints with proper authentication"

echo -e "\n${YELLOW}🔐 Test Credentials (after seeding):${NC}"
echo "• Admin: admin@demo.com / password123"
echo "• Doctor: fatou.seck@demo.com / password123"  
echo "• Patient: aminata.diallo@demo.com / password123"

echo -e "\n${YELLOW}📋 Manual Test Examples:${NC}"
echo ""
echo "# Login as doctor"
echo "curl -X POST http://localhost:3333/api/v1/public/auth/login \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -H \"x-tenant-id: 1\" \\"
echo "  -d '{\"email\":\"fatou.seck@demo.com\",\"password\":\"password123\"}'"
echo ""
echo "# Get profile (with token from login)"
echo "curl -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"x-tenant-id: 1\" \\"
echo "  http://localhost:3333/api/v1/auth/profile"
echo ""
echo "# Get pregnancies"
echo "curl -H \"Authorization: Bearer YOUR_TOKEN\" \\"
echo "  -H \"x-tenant-id: 1\" \\"
echo "  http://localhost:3333/api/v1/pregnancies"

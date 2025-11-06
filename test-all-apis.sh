#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API="http://localhost:5000"
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     API Endpoint Testing Suite             ║${NC}"
echo -e "${BLUE}║     Friasoft School Management System      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"

# Function to test endpoint
test_endpoint() {
  local test_name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local token="$5"
  
  echo -ne "${YELLOW}Testing:${NC} $test_name ... "
  
  if [ -z "$data" ]; then
    if [ -z "$token" ]; then
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$API$endpoint")
    else
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$API$endpoint" -H "Authorization: Bearer $token")
    fi
  else
    if [ -z "$token" ]; then
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$API$endpoint" -H "Content-Type: application/json" -d "$data")
    else
      response=$(curl -s -w "\n%{http_code}" -X "$method" "$API$endpoint" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "$data")
    fi
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [[ "$http_code" =~ ^[2][0-9]{2}$ ]]; then
    echo -e "${GREEN}✓ ($http_code)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo "$body"
  else
    echo -e "${RED}✗ ($http_code)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "Response: $body"
  fi
  echo ""
}

# 1. Health Check
echo -e "${BLUE}[1] SYSTEM HEALTH CHECK${NC}"
test_endpoint "Health check" "GET" "/api/health" ""

# 2. Authentication
echo -e "${BLUE}[2] AUTHENTICATION${NC}"
login_response=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@friasoft-test.com","password":"password123"}')

ACCESS_TOKEN=$(echo $login_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
echo "Login response: $login_response"
echo -e "${GREEN}Access Token: $ACCESS_TOKEN${NC}\n"

test_endpoint "Get current user" "GET" "/api/auth/me" "" "$ACCESS_TOKEN"

# 3. Schools
echo -e "${BLUE}[3] SCHOOLS MANAGEMENT${NC}"
test_endpoint "List schools" "GET" "/api/schools?page=1&pageSize=20" "" "$ACCESS_TOKEN"
test_endpoint "Get school details" "GET" "/api/schools" "" "$ACCESS_TOKEN"

# Get school ID from response
school_response=$(curl -s -X GET "$API/api/schools?page=1&pageSize=20" -H "Authorization: Bearer $ACCESS_TOKEN")
SCHOOL_ID=$(echo "$school_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "School ID: $SCHOOL_ID\n"

# 4. Users
echo -e "${BLUE}[4] USERS MANAGEMENT${NC}"
test_endpoint "List users" "GET" "/api/users?schoolId=$SCHOOL_ID&page=1" "" "$ACCESS_TOKEN"

# Get user ID
user_response=$(curl -s -X GET "$API/api/users?schoolId=$SCHOOL_ID&page=1" -H "Authorization: Bearer $ACCESS_TOKEN")
USER_ID=$(echo "$user_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "User ID: $USER_ID\n"

test_endpoint "Get user details" "GET" "/api/users/$USER_ID" "" "$ACCESS_TOKEN"

# 5. Students
echo -e "${BLUE}[5] STUDENTS MANAGEMENT${NC}"
test_endpoint "List students" "GET" "/api/students?schoolId=$SCHOOL_ID&page=1" "" "$ACCESS_TOKEN"

# Get student ID
student_response=$(curl -s -X GET "$API/api/students?schoolId=$SCHOOL_ID&page=1" -H "Authorization: Bearer $ACCESS_TOKEN")
STUDENT_ID=$(echo "$student_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "Student ID: $STUDENT_ID\n"

test_endpoint "Get student details" "GET" "/api/students/$STUDENT_ID" "" "$ACCESS_TOKEN"

# 6. Classes
echo -e "${BLUE}[6] CLASSES MANAGEMENT${NC}"
test_endpoint "List classes" "GET" "/api/classes?schoolId=$SCHOOL_ID&page=1" "" "$ACCESS_TOKEN"

# Get class ID
class_response=$(curl -s -X GET "$API/api/classes?schoolId=$SCHOOL_ID&page=1" -H "Authorization: Bearer $ACCESS_TOKEN")
CLASS_ID=$(echo "$class_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "Class ID: $CLASS_ID\n"

test_endpoint "Get class details" "GET" "/api/classes/$CLASS_ID" "" "$ACCESS_TOKEN"

# 7. Subjects
echo -e "${BLUE}[7] SUBJECTS MANAGEMENT${NC}"
test_endpoint "List subjects" "GET" "/api/subjects?schoolId=$SCHOOL_ID&page=1" "" "$ACCESS_TOKEN"

# Get subject ID
subject_response=$(curl -s -X GET "$API/api/subjects?schoolId=$SCHOOL_ID&page=1" -H "Authorization: Bearer $ACCESS_TOKEN")
SUBJECT_ID=$(echo "$subject_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "Subject ID: $SUBJECT_ID\n"

test_endpoint "Get subject details" "GET" "/api/subjects/$SUBJECT_ID" "" "$ACCESS_TOKEN"

# 8. Grades
echo -e "${BLUE}[8] GRADES MANAGEMENT${NC}"
test_endpoint "Get student grades" "GET" "/api/grades/student/$STUDENT_ID?academicYear=2024-2025" "" "$ACCESS_TOKEN"
test_endpoint "Get class grades" "GET" "/api/grades/class/$CLASS_ID?term=Term%201" "" "$ACCESS_TOKEN"

# 9. Timetable
echo -e "${BLUE}[9] TIMETABLE MANAGEMENT${NC}"
test_endpoint "Get class timetable" "GET" "/api/timetable?classId=$CLASS_ID" "" "$ACCESS_TOKEN"

# 10. Invoices/Financial
echo -e "${BLUE}[10] INVOICES/FINANCIAL MANAGEMENT${NC}"
test_endpoint "List invoices" "GET" "/api/invoices?schoolId=$SCHOOL_ID&status=sent&page=1" "" "$ACCESS_TOKEN"

# Get invoice ID
invoice_response=$(curl -s -X GET "$API/api/invoices?schoolId=$SCHOOL_ID&status=sent&page=1" -H "Authorization: Bearer $ACCESS_TOKEN")
INVOICE_ID=$(echo "$invoice_response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo -e "Invoice ID: $INVOICE_ID\n"

test_endpoint "Get invoice details" "GET" "/api/invoices/$INVOICE_ID" "" "$ACCESS_TOKEN"
test_endpoint "Get financial report" "GET" "/api/invoices/reports/summary?schoolId=$SCHOOL_ID" "" "$ACCESS_TOKEN"

# Final Summary
echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     TEST SUMMARY                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}\n"
  exit 0
else
  echo -e "${RED}✗ Some tests failed.${NC}\n"
  exit 1
fi

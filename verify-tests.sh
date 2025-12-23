#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Yearbook Test Suite Verification                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check configuration files
echo "📋 Configuration Files:"
if [ -f "jest.config.js" ]; then
    echo "  ✅ jest.config.js"
else
    echo "  ❌ jest.config.js (missing)"
fi

if [ -f "jest.setup.js" ]; then
    echo "  ✅ jest.setup.js"
else
    echo "  ❌ jest.setup.js (missing)"
fi

if [ -f "TEST_DOCUMENTATION.md" ]; then
    echo "  ✅ TEST_DOCUMENTATION.md"
else
    echo "  ❌ TEST_DOCUMENTATION.md (missing)"
fi

echo ""

# Count test files
echo "🧪 Test Files:"
test_count=$(find __tests__ -name "*.test.ts*" -type f 2>/dev/null | wc -l)
echo "  Total: $test_count files"
echo ""

# List test files
find __tests__ -name "*.test.ts*" -type f | sort | while read file; do
    test_name=$(basename "$file" .test.tsx)
    test_name=$(basename "$test_name" .test.ts)
    line_count=$(wc -l < "$file")
    echo "  ✅ $file ($line_count lines)"
done

echo ""

# Check package.json for test scripts
echo "📦 Package.json Scripts:"
if grep -q '"test"' package.json; then
    echo "  ✅ npm test"
fi
if grep -q '"test:watch"' package.json; then
    echo "  ✅ npm run test:watch"
fi
if grep -q '"test:coverage"' package.json; then
    echo "  ✅ npm run test:coverage"
fi

echo ""

# Check for test dependencies
echo "📚 Test Dependencies:"
deps=("@testing-library/react" "@testing-library/jest-dom" "@testing-library/user-event" "jest" "jest-environment-jsdom" "@types/jest")
for dep in "${deps[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "  ✅ $dep"
    else
        echo "  ⚠️  $dep (needs installation)"
    fi
done

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Test suite ready! Run 'npm install' then 'npm test'         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
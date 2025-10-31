#!/bin/bash

echo "🧪 RUNNING COMPLETE TEST SUITE"

echo "🔍 Running Django tests..."
python manage.py test --keepdb --parallel

echo "⚡ Running JavaScript unit tests..."
npx jest --config jest.config.js frontend/tests/unit --verbose

echo "🔗 Running JavaScript integration tests..."
npx jest --config jest.config.js frontend/tests/integration --verbose

echo "📊 Generating coverage report..."
npx jest --config jest.config.js --coverage --collectCoverageFrom='["frontend/static/js/**/*.js"]'

echo "🔒 Running security checks..."
python manage.py check --deploy

echo "✅ ALL TESTS COMPLETED"
#!/bin/bash
echo "Running Django tests..."

echo "1. Testing posts..."
python manage.py test posts --verbosity=1

echo "2. Testing home..."
python manage.py test home --verbosity=1

echo "3. Testing users..."
python manage.py test users --verbosity=1

echo "4. Testing comments..."
python manage.py test comments --verbosity=1

echo "5. Testing communities..."
python manage.py test communities --verbosity=1

echo "6. All tests together..."
python manage.py test --verbosity=1

echo "Tests completed!"
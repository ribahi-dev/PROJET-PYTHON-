#!/usr/bin/env python
"""
Script de test pour l'endpoint d'enregistrement
"""
import os
import django
import json
from django.test import Client

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# Client test
client = Client()

# Test 1: Enregistrement valide - Client
print("=" * 60)
print("TEST 1: Enregistrement valide - Client")
print("=" * 60)

response = client.post(
    '/api/register/',
    data=json.dumps({
        "username": "testclient",
        "email": "client@example.com",
        "password": "SecurePassword123",
        "password_confirm": "SecurePassword123",
        "role": "client"
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

# Test 2: Enregistrement valide - Coach
print("=" * 60)
print("TEST 2: Enregistrement valide - Coach")
print("=" * 60)

response = client.post(
    '/api/register/',
    data=json.dumps({
        "username": "testcoach",
        "email": "coach@example.com",
        "password": "CoachPass123",
        "password_confirm": "CoachPass123",
        "role": "coach"
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

# Test 3: Erreur - Mots de passe différents
print("=" * 60)
print("TEST 3: Erreur - Mots de passe différents")
print("=" * 60)

response = client.post(
    '/api/register/',
    data=json.dumps({
        "username": "testuser3",
        "email": "test3@example.com",
        "password": "Password123",
        "password_confirm": "Different",
        "role": "client"
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

# Test 4: Erreur - Username déjà utilisé
print("=" * 60)
print("TEST 4: Erreur - Username déjà utilisé")
print("=" * 60)

response = client.post(
    '/api/register/',
    data=json.dumps({
        "username": "testclient",
        "email": "another@example.com",
        "password": "AnotherPass123",
        "password_confirm": "AnotherPass123",
        "role": "client"
    }),
    content_type='application/json'
)

print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
print()

print("✅ Tous les tests sont terminés!")

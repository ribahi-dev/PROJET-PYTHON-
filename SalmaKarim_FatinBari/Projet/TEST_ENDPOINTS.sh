#!/bin/bash
# Snippets de test pour l'API - Plateforme de Réservation
# Exécutez ces commandes curl pour tester les endpoints

# Configuration
API_URL="http://localhost:8000/api"
TOKEN=""  # À remplir après authentification

# ========================================
# 1. AUTHENTIFICATION
# ========================================

# Enregistrer un nouvel utilisateur
echo "=== Enregistrement nouveau user ==="
curl -X POST "$API_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpass123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Obtenir un token (remplacer username/password)
echo -e "\n=== Obtenir un token ==="
curl -X POST "$API_URL/auth/token/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123"
  }'

# Rafraîchir le token (remplacer le refresh token)
echo -e "\n=== Rafraîchir le token ==="
curl -X POST "$API_URL/auth/token/refresh/" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "votre_refresh_token"
  }'

# Récupérer son profil
echo -e "\n=== Profil utilisateur actuel ==="
curl -X GET "$API_URL/auth/me/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# 2. UTILISATEURS
# ========================================

# Lister les utilisateurs (authenticated)
echo -e "\n=== Lister les utilisateurs ==="
curl -X GET "$API_URL/users/" \
  -H "Authorization: Bearer $TOKEN"

# Rechercher un utilisateur
echo -e "\n=== Rechercher un utilisateur ==="
curl -X GET "$API_URL/users/?search=alice" \
  -H "Authorization: Bearer $TOKEN"

# Filtrer les utilisateurs staff
echo -e "\n=== Filtrer utilisateurs staff ==="
curl -X GET "$API_URL/users/?is_staff=true" \
  -H "Authorization: Bearer $TOKEN"

# Voir les réservations d'un utilisateur
echo -e "\n=== Réservations d'un utilisateur ==="
curl -X GET "$API_URL/users/1/bookings/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# 3. SALLES
# ========================================

# Lister les salles (pas d'authentification requise)
echo -e "\n=== Lister les salles ==="
curl -X GET "$API_URL/rooms/"

# Rechercher une salle par nom
echo -e "\n=== Rechercher une salle ==="
curl -X GET "$API_URL/rooms/?search=conference"

# Filtrer les salles par capacité
echo -e "\n=== Salles avec capacité >= 20 ==="
curl -X GET "$API_URL/rooms/?capacity__gte=20"

# Créer une salle (staff required)
echo -e "\n=== Créer une salle ==="
curl -X POST "$API_URL/rooms/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salle Test",
    "capacity": 25,
    "location": "Bâtiment 3, Étage 2",
    "description": "Salle de test avec vidéoprojecteur"
  }'

# Voir la disponibilité d'une salle pour une date
echo -e "\n=== Disponibilité d'une salle ==="
curl -X GET "$API_URL/rooms/1/availability/?date=2024-04-25" \
  -H "Authorization: Bearer $TOKEN"

# Voir la disponibilité de toutes les salles
echo -e "\n=== Disponibilité de toutes les salles ==="
curl -X GET "$API_URL/rooms/all_availability/?date=2024-04-25" \
  -H "Authorization: Bearer $TOKEN"

# Désactiver une salle (admin required)
echo -e "\n=== Désactiver une salle ==="
curl -X POST "$API_URL/rooms/1/deactivate/" \
  -H "Authorization: Bearer $TOKEN"

# Activer une salle (admin required)
echo -e "\n=== Activer une salle ==="
curl -X POST "$API_URL/rooms/1/activate/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# 4. RÉSERVATIONS
# ========================================

# Lister mes réservations
echo -e "\n=== Mes réservations ==="
curl -X GET "$API_URL/bookings/" \
  -H "Authorization: Bearer $TOKEN"

# Filtrer par statut
echo -e "\n=== Réservations confirmées ==="
curl -X GET "$API_URL/bookings/?status=CONFIRMEE" \
  -H "Authorization: Bearer $TOKEN"

# Filtrer par date
echo -e "\n=== Réservations pour une date ==="
curl -X GET "$API_URL/bookings/?date=2024-04-25" \
  -H "Authorization: Bearer $TOKEN"

# Créer une réservation
echo -e "\n=== Créer une réservation ==="
curl -X POST "$API_URL/bookings/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room": 1,
    "date": "2024-04-25",
    "start_time": "14:00",
    "end_time": "15:00",
    "purpose": "Réunion d'\''équipe"
  }'

# Vérifier la disponibilité (créneaux libres)
echo -e "\n=== Vérifier les créneaux disponibles ==="
curl -X POST "$API_URL/bookings/check_availability/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room": 1,
    "date": "2024-04-25"
  }'

# Annuler une réservation
echo -e "\n=== Annuler une réservation ==="
curl -X POST "$API_URL/bookings/1/cancel/" \
  -H "Authorization: Bearer $TOKEN"

# Confirmer une réservation (staff required)
echo -e "\n=== Confirmer une réservation ==="
curl -X POST "$API_URL/bookings/1/confirm/" \
  -H "Authorization: Bearer $TOKEN"

# Récupérer mes réservations
echo -e "\n=== Récupérer mes réservations ==="
curl -X GET "$API_URL/bookings/my_bookings/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# 5. PARAMÈTRES ET STATISTIQUES
# ========================================

# Lister les paramètres
echo -e "\n=== Lister les paramètres ==="
curl -X GET "$API_URL/settings/" \
  -H "Authorization: Bearer $TOKEN"

# Voir le tableau de bord (statistiques)
echo -e "\n=== Tableau de bord ==="
curl -X GET "$API_URL/settings/dashboard/" \
  -H "Authorization: Bearer $TOKEN"

# Voir l'état du système (admin required)
echo -e "\n=== État du système ==="
curl -X GET "$API_URL/settings/system_health/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# 6. EXEMPLES AVANCÉS
# ========================================

# Pagination - page 2
echo -e "\n=== Pagination (page 2) ==="
curl -X GET "$API_URL/bookings/?page=2" \
  -H "Authorization: Bearer $TOKEN"

# Recherche combinée
echo -e "\n=== Recherche combinée ==="
curl -X GET "$API_URL/bookings/?search=reunion&status=CONFIRMEE&ordering=-created_at" \
  -H "Authorization: Bearer $TOKEN"

# Créer une réservation avec conflit (devrait échouer)
echo -e "\n=== Créer une réservation en conflit (test erreur) ==="
curl -X POST "$API_URL/bookings/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "room": 1,
    "date": "2024-04-25",
    "start_time": "14:30",
    "end_time": "15:00",
    "purpose": "Conflit avec réunion existante"
  }'

# ========================================
# 7. ADMIN OPERATIONS
# ========================================

# Modifier un paramètre (admin required)
echo -e "\n=== Modifier un paramètre ==="
curl -X PATCH "$API_URL/settings/1/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "60"
  }'

# Supprimer une réservation (admin required)
echo -e "\n=== Supprimer une réservation ==="
curl -X DELETE "$API_URL/bookings/1/" \
  -H "Authorization: Bearer $TOKEN"

# ========================================
# NOTES IMPORTANTES
# ========================================

# 1. Remplacer $TOKEN par votre token JWT réel
# 2. Remplacer les IDs (1, 2, etc.) par les vrais IDs
# 3. Adapter les dates aux dates futures (format YYYY-MM-DD)
# 4. Les heures sont au format HH:MM (24h)
# 5. Les opérations admin requièrent is_staff=true

# Pour obtenir rapidement un token avec admin:
# curl -X POST http://localhost:8000/api/auth/token/ \
#   -H "Content-Type: application/json" \
#   -d '{"username":"admin","password":"admin123"}'

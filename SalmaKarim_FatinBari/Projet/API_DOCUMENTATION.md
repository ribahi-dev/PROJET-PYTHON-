# Documentation de l'API - Plateforme de Réservation de Salles

## Vue d'ensemble

Cette API fournit une plateforme complète de gestion de réservation de salles avec:
- Authentification JWT
- Gestion des utilisateurs
- Gestion des salles
- Système de réservation avec détection de conflits
- Statistiques et tableau de bord
- Tests complets

## Configuration

### Installation des dépendances

```bash
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter
python manage.py migrate
```

### Lancer le serveur

```bash
python manage.py runserver
```

## Endpoints de l'API

### Authentication

#### Obtenir un token JWT
```
POST /api/auth/token/
Content-Type: application/json

{
  "username": "utilisateur",
  "password": "motdepasse"
}
```

#### Rafraîchir le token
```
POST /api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "votre_refresh_token"
}
```

#### Enregistrer un nouvel utilisateur
```
POST /api/auth/register/
Content-Type: application/json

{
  "username": "nouvel_utilisateur",
  "email": "user@example.com",
  "password": "motdepasse_securise",
  "first_name": "Prénom",
  "last_name": "Nom",
  "phone": "0612345678",
  "department": "IT"
}
```

#### Récupérer le profil de l'utilisateur actuel
```
GET /api/auth/me/
Authorization: Bearer <token>
```

### Utilisateurs

#### Lister tous les utilisateurs (staff seulement)
```
GET /api/users/
Authorization: Bearer <token>
```

**Paramètres de filtrage:**
- `is_staff`: true/false
- `is_active`: true/false
- `search`: terme de recherche (username, email, nom, département)

#### Récupérer les réservations d'un utilisateur
```
GET /api/users/{id}/bookings/
Authorization: Bearer <token>
```

### Salles

#### Lister toutes les salles actives
```
GET /api/rooms/
```

**Paramètres:**
- `search`: rechercher par nom, localisation, description
- `capacity__gte`: capacité minimale
- `capacity__lte`: capacité maximale
- `ordering`: trier par name, capacity, created_at

#### Créer une salle (staff seulement)
```
POST /api/rooms/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Salle de conférence A",
  "capacity": 20,
  "location": "Bâtiment 1, Étage 2",
  "description": "Grande salle avec vidéoprojecteur"
}
```

#### Récupérer les détails d'une salle
```
GET /api/rooms/{id}/
```

#### Vérifier la disponibilité d'une salle
```
GET /api/rooms/{id}/availability/?date=2024-04-22
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "room": {
    "id": 1,
    "name": "Salle A",
    "capacity": 20,
    "location": "Bâtiment 1"
  },
  "date": "2024-04-22",
  "bookings": [
    {
      "start_time": "09:00:00",
      "end_time": "10:00:00",
      "user__username": "utilisateur1",
      "status": "CONFIRMEE"
    }
  ],
  "availability": [
    {
      "start": "08:00:00",
      "end": "09:00:00"
    },
    {
      "start": "10:00:00",
      "end": "18:00:00"
    }
  ]
}
```

#### Voir la disponibilité de toutes les salles
```
GET /api/rooms/all_availability/?date=2024-04-22
Authorization: Bearer <token>
```

#### Désactiver une salle (staff seulement)
```
POST /api/rooms/{id}/deactivate/
Authorization: Bearer <token>
```

#### Activer une salle (staff seulement)
```
POST /api/rooms/{id}/activate/
Authorization: Bearer <token>
```

### Réservations

#### Créer une réservation
```
POST /api/bookings/
Authorization: Bearer <token>
Content-Type: application/json

{
  "room": 1,
  "date": "2024-04-22",
  "start_time": "09:00",
  "end_time": "10:00",
  "purpose": "Réunion d'équipe"
}
```

**Réponse en cas de conflit:**
```json
{
  "non_field_errors": [
    "Conflit détecté: la salle est réservée: 09:30-11:00 (utilisateur2), ..."
  ]
}
```

#### Lister les réservations
```
GET /api/bookings/
Authorization: Bearer <token>
```

**Paramètres:**
- `status`: EN_ATTENTE, CONFIRMEE, ANNULEE
- `date`: filtrer par date
- `room`: filtrer par salle
- `search`: rechercher par salle, objectif, utilisateur
- `ordering`: trier par date, start_time, created_at

#### Récupérer mes réservations
```
GET /api/bookings/my_bookings/
Authorization: Bearer <token>
```

#### Vérifier la disponibilité
```
POST /api/bookings/check_availability/
Authorization: Bearer <token>
Content-Type: application/json

{
  "room": 1,
  "date": "2024-04-22"
}
```

#### Annuler une réservation
```
POST /api/bookings/{id}/cancel/
Authorization: Bearer <token>
```

#### Confirmer une réservation (staff seulement)
```
POST /api/bookings/{id}/confirm/
Authorization: Bearer <token>
```

### Paramètres et Settings

#### Lister tous les settings
```
GET /api/settings/
Authorization: Bearer <token>
```

#### Voir le tableau de bord des statistiques
```
GET /api/settings/dashboard/
Authorization: Bearer <token>
```

**Réponse:**
```json
{
  "statistics": {
    "total_bookings": 42,
    "today_bookings": 5,
    "upcoming_bookings": 12,
    "confirmed_bookings": 35,
    "cancelled_bookings": 7,
    "total_rooms": 10,
    "active_rooms": 9
  },
  "rooms_statistics": [
    {
      "name": "Salle A",
      "capacity": 20,
      "booking_count": 15
    }
  ],
  "recent_bookings": [
    {
      "date": "2024-04-22",
      "count": 5
    }
  ]
}
```

#### État du système (admin seulement)
```
GET /api/settings/system_health/
Authorization: Bearer <token>
```

## Codes de statut HTTP

- **200 OK**: Requête réussie
- **201 Created**: Ressource créée
- **400 Bad Request**: Données invalides
- **401 Unauthorized**: Authentification requise
- **403 Forbidden**: Accès refusé
- **404 Not Found**: Ressource non trouvée
- **429 Too Many Requests**: Trop de requêtes

## Erreurs courantes

### Conflit de réservation
```json
{
  "non_field_errors": [
    "Conflit détecté: la salle est réservée: 09:30-10:30 (utilisateur1)"
  ]
}
```

### Date invalide
```json
{
  "date": [
    "La date ne peut pas être dans le passé."
  ]
}
```

### Heure invalide
```json
{
  "non_field_errors": [
    "L'heure de fin doit être après l'heure de début."
  ]
}
```

## Authentification

Tous les endpoints (sauf register) nécessitent un token JWT dans le header:

```
Authorization: Bearer <votre_token_jwt>
```

## Rate Limiting

- Utilisateurs anonymes: 100 requêtes/heure
- Utilisateurs authentifiés: 1000 requêtes/heure

## Tests

Lancer les tests:
```bash
python manage.py test
```

Tests spécifiques:
```bash
python manage.py test users.tests
python manage.py test rooms.tests
python manage.py test bookings.tests
python manage.py test sris.tests
```

## Modèles de données

### User
- `id`: ID unique
- `username`: Nom d'utilisateur unique
- `email`: Email unique
- `first_name`: Prénom
- `last_name`: Nom
- `phone`: Téléphone
- `department`: Département
- `is_staff`: Est administrateur
- `is_active`: Est actif
- `date_joined`: Date d'inscription

### Room
- `id`: ID unique
- `name`: Nom unique
- `capacity`: Capacité (nombre de personnes)
- `location`: Localisation
- `description`: Description
- `is_active`: Est active
- `created_at`: Date de création
- `updated_at`: Date de dernière modification

### Booking
- `id`: ID unique
- `user`: Utilisateur qui a réservé
- `room`: Salle réservée
- `date`: Date de réservation
- `start_time`: Heure de début
- `end_time`: Heure de fin
- `status`: Statut (EN_ATTENTE, CONFIRMEE, ANNULEE)
- `purpose`: Objectif de la réservation
- `created_at`: Date de création
- `updated_at`: Date de dernière modification

### AppSetting
- `id`: ID unique
- `key`: Clé unique
- `value`: Valeur
- `label`: Étiquette
- `description`: Description
- `is_active`: Est actif
- `created_at`: Date de création
- `updated_at`: Date de dernière modification

## Permissions

- **Utilisateurs anonymes**: Lecture seule sur les salles
- **Utilisateurs authentifiés**: Créer/modifier/voir leurs propres réservations
- **Staff**: Gestion complète (salles, réservations, utilisateurs, settings)
- **Admin**: Accès système complet

## CORS

CORS est activé pour toutes les origines (développement).
Pour la production, modifier `CORS_ALLOWED_ORIGINS` dans `settings.py`.

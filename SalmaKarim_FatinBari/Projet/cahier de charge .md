Cahier des Charges
Système de Réservation Intelligente des Salles


Réalisé par : Salma Karim & Fatine Elbari
Encadré par : Mr Mohammed Gamal
Année universitaire 2025 – 2026
 
1. Contexte du projet


Dans les établissements universitaires, la gestion des salles de cours et des infrastructures devient rapidement complexe face à la croissance du nombre d'étudiants, d'enseignants et d'activités. Les réservations manuelles génèrent fréquemment des conflits de planning et une mauvaise optimisation des espaces disponibles.

Ce projet vise à développer une application web moderne, basée sur le framework Django (Python), afin de gérer efficacement les réservations des salles et infrastructures au sein de l'université.

2. Objectifs du projet


2.1 Objectif général
Développer une application web permettant de consulter, gérer et réserver les salles de l'établissement de manière simple, rapide et fiable.

2.2 Objectifs spécifiques
•	Faciliter la réservation des salles en ligne
•	Éviter les conflits de réservation grâce à la vérification automatique des disponibilités
•	Améliorer l'organisation et la visibilité des infrastructures
•	Permettre à l'administration de suivre et superviser l'utilisation des salles
•	Offrir une interface simple, intuitive et accessible depuis un navigateur web
•	Assurer la sécurité des données et des accès utilisateurs

3. Acteurs du système


Le tableau suivant présente les différents acteurs du système et leurs responsabilités :

Acteur	Rôle / Responsabilités
Étudiant	Consulter les salles disponibles, réserver une salle pour un projet ou travail de groupe
Enseignant	Réserver des salles pour les cours ou réunions pédagogiques
Administration	Superviser les réservations, gérer les salles et les infrastructures
Administrateur système	Gérer les comptes utilisateurs, la base de données, et la maintenance

4. Fonctionnalités du système


4.1 Gestion des utilisateurs
•	Inscription et création de compte utilisateur
•	Authentification sécurisée (login / logout)
•	Gestion des profils et des rôles (étudiant, enseignant, admin)
•	Réinitialisation de mot de passe par email

4.2 Gestion des salles
•	Ajout, modification et suppression de salles
•	Consultation de la liste des salles avec leurs caractéristiques
•	Filtrage par capacité, équipements et disponibilité

4.3 Gestion des réservations
•	Réservation d'une salle pour une date et un créneau horaire
•	Consultation des réservations en cours et passées
•	Modification et annulation d'une réservation
•	Tableau de bord récapitulatif pour l'administration

4.4 Vérification des disponibilités
•	Affichage en temps réel des salles disponibles
•	Détection et prévention automatique des conflits de réservation
•	Calendrier visuel des réservations par salle

5. Contraintes du système


5.1 Contraintes techniques
•	Utilisation de Python 3.x comme langage de programmation principal
•	Framework Django pour le développement back-end (MVT)
•	Base de données relationnelle PostgreSQL (ou SQLite en développement)
•	Application accessible via un navigateur web standard (responsive design)

5.2 Contraintes de sécurité
•	Authentification obligatoire pour accéder au système
•	Gestion des permissions par rôle (RBAC)
•	Protection contre les injections SQL via l'ORM Django
•	Tokens CSRF sur tous les formulaires

5.3 Contraintes d'utilisation
•	Interface simple, ergonomique et adaptée à tous les utilisateurs
•	Temps de réponse rapide pour toutes les opérations
•	Disponibilité du système durant toute l'année universitaire

6. Données du système


6.1 Modèle Utilisateur (User)
•	id — identifiant unique
•	username — nom d'utilisateur
•	email — adresse email
•	password — mot de passe hashé
•	role — étudiant / enseignant / admin

6.2 Modèle Salle (Room)
•	id — identifiant unique de la salle
•	name — nom ou numéro de la salle
•	capacity — capacité maximale
•	equipment — liste des équipements disponibles
•	is_active — statut de disponibilité de la salle

6.3 Modèle Réservation (Booking)
•	id — identifiant unique de la réservation
•	user — clé étrangère vers l'utilisateur
•	room — clé étrangère vers la salle
•	date — date de la réservation
•	start_time — heure de début
•	end_time — heure de fin
•	status — en attente / confirmée / annulée

7. Technologies et outils


Le tableau suivant récapitule les technologies et outils retenus pour le développement du projet :

Catégorie	Technologie / Outil
Langage back-end	Python 3.x
Framework web	Django 4.x (architecture MVT)
ORM	Django ORM (gestion des modèles et migrations)
Base de données	PostgreSQL (production) / SQLite (développement)
Front-end	HTML5, CSS3, JavaScript (ES6+)
Framework CSS	Bootstrap 5 (responsive design)
Templating	Django Templates (Jinja2-compatible)
Authentification	Django Authentication System + django-allauth
Environnement	Virtualenv / pip
Éditeur de code	Visual Studio Code
Versioning	Git / GitHub
Modélisation	draw.io / StarUML (diagrammes UML)
Tests	Django TestCase (tests unitaires et d'intégration)
Navigateur de test	Google Chrome / Firefox

8. Architecture du projet Django


Le projet suivra l'architecture MVT (Model – View – Template) propre à Django, organisée de la manière suivante :

•	models.py — définition des entités (User, Room, Booking) et de la base de données
•	views.py — logique métier et traitement des requêtes HTTP
•	urls.py — routage des URLs vers les vues correspondantes
•	templates/ — pages HTML rendues côté serveur
•	forms.py — formulaires de saisie et de validation des données
•	admin.py — interface d'administration Django
•	tests.py — tests unitaires et fonctionnels

9. Résultats attendus


À la fin du projet, le système devra permettre :

•	Une gestion simple, rapide et efficace des réservations de salles
•	Une meilleure organisation et visibilité des infrastructures universitaires
•	Une réduction significative des conflits de planning
•	Une interface web intuitive accessible à tous les acteurs
•	Un tableau de bord d'administration complet et fonctionnel
•	Un code maintenable, testé et documenté, conforme aux bonnes pratiques Django

10. Conclusion


Ce cahier des charges définit les bases du Système de Réservation Intelligente des Salles. Le choix de Python et Django comme technologies principales garantit un développement rapide, sécurisé et maintenable, avec un écosystème riche et une communauté active.

Grâce à ce système, l'université disposera d'un outil moderne permettant d'optimiser l'utilisation de ses infrastructures et d'améliorer l'expérience de l'ensemble de ses utilisateurs.
 
MÉMOIRE DE PROJET — CAHIER DES CHARGES ÉTENDU


Système de Réservation Intelligente des Salles
SRIS — Application Web Django

Analyse de l'état de l'art · Étude scientifique · Architecture · Positionnement du projet

Réalisé par :
Salma Karim  &  Fatine Elbari

Encadrant(e) : MOHAMED GOMAL
Établissement :EMSI
Année universitaire : 2025–2026
 
Résumé (Abstract)
Résumé en français
Ce projet consiste à concevoir et développer le Système de Réservation Intelligente des Salles (SRIS), une application web basée sur le framework Django (Python). Le système permet aux étudiants et aux enseignants de réserver des salles universitaires en ligne, avec vérification automatique des conflits de planning et gestion des disponibilités en temps réel.
L'architecture repose sur le patron de conception MVT (Model-View-Template) propre à Django, une base de données relationnelle PostgreSQL, et un contrôle d'accès basé sur les rôles (RBAC — Role-Based Access Control) pour distinguer les permissions des étudiants, enseignants et administrateurs. Le système intègre un calendrier visuel des réservations et un tableau de bord d'administration complet.
Mots-clés : Réservation de salles, Django MVT, RBAC, Détection de conflits, PostgreSQL, Gestion des ressources universitaires, Application web, Bootstrap 5.


Abstract (English)
This project involves designing and developing the Intelligent Room Reservation System (SRIS), a web application based on the Django (Python) framework. The system enables students and teachers to book university rooms online, with automatic scheduling conflict detection and real-time availability management.
Keywords: Room Booking System, Django MVT, RBAC, Conflict Detection, PostgreSQL, University Resource Management, Web Application, Bootstrap 5.

 
1. Introduction et Contexte
1.1 Contexte général
La gestion des espaces physiques dans les établissements d'enseignement supérieur constitue un défi organisationnel majeur. Face à la croissance des effectifs étudiants, à la multiplication des activités pédagogiques et parascolaires, et à la diversification des besoins des enseignants, les méthodes traditionnelles de réservation — registres papier, appels téléphoniques, courriels ad hoc — montrent rapidement leurs limites.
Une étude publiée dans Paper Publications (2023-2024) sur les systèmes de réservation de micro-salles en université souligne que le système traditionnel impose aux utilisateurs d'être physiquement présents ou de téléphoner pour réserver, ce qui est chronophage et inefficace. De plus, l'absence de mécanisme centralisé de détection des conflits entraîne des doubles réservations et une sous-utilisation des espaces disponibles.
Du côté de l'administration universitaire, la visibilité sur l'occupation des salles est limitée, rendant difficile toute décision d'optimisation des ressources infrastructurelles. Une étude sur 78% des institutions révèle qu'elles pourraient être plus efficaces dans la gestion de leurs espaces en adoptant des outils numériques adaptés. 
1.2 Problématique
Question de recherche centrale
Comment concevoir un système web de réservation de salles universitaires permettant la gestion centralisée des demandes, la détection automatique des conflits de planning, et le contrôle d'accès différencié par rôle (étudiant, enseignant, administrateur), tout en garantissant la fiabilité, la sécurité et l'ergonomie de l'application ?


Cette problématique soulève plusieurs sous-questions techniques et organisationnelles :
•	Comment modéliser la logique de détection de conflits de réservation au niveau de la base de données pour garantir l'intégrité des données même en cas d'accès concurrent ?
•	Quel modèle de contrôle d'accès adopter pour gérer des permissions hétérogènes entre étudiants, enseignants et administrateurs ?
•	Comment concevoir une interface de calendrier visuel permettant une lecture intuitive des disponibilités par salle et par créneau ?
•	Comment assurer la sécurité des données (authentification, CSRF, injections SQL) dans un contexte universitaire multi-utilisateurs ?
1.3 Objectifs du projet
Le projet poursuit deux objectifs complémentaires :
1.	Un objectif fonctionnel : fournir un outil opérationnel de gestion des réservations utilisable quotidiennement par l'ensemble des acteurs universitaires.
2.	Un objectif académique : concevoir un système robuste, documenté et conforme aux bonnes pratiques de l'ingénierie logicielle web (architecture MVT, RBAC, tests unitaires, sécurité OWASP).
 
2. État de l'Art
2.1 Évolution des systèmes de réservation en ligne
Les systèmes de réservation en ligne ont connu une évolution en trois phases qui reflète l'évolution des architectures web et des attentes des utilisateurs.

Génération	Caractéristiques	Limites identifiées
1re génération (1990s–2000s)	Formulaires HTML statiques, stockage fichiers CSV/texte, aucune détection automatique des conflits	Architecture procédurale mêlant accès aux données et logique métier. Pas de contrôle d'accès.
2e génération (2000s–2015)	Bases de données relationnelles, interfaces web dynamiques (PHP/ASP), détection de conflits par requêtes SQL basiques	Validation souvent uniquement côté interface. Opérations de réservation non atomiques. RBAC insuffisant.
3e génération (2015–présent)	Frameworks MVC/MVT (Django, Rails, Spring), ORM, RBAC natif, APIs REST, calendriers interactifs, temps réel	Complexité d'intégration avec les systèmes d'emploi du temps existants. IoT et capteurs d'occupation émergents.
2.2 Travaux sur les systèmes de réservation de salles universitaires
IEEE Xplore (2021) — Integrated Room Reservation System : Une étude conduite dans une université des Philippines [1] documente les problèmes des réservations manuelles : déplacements physiques importants, dépendance aux personnels autorisés, temps de traitement élevé. Le système développé permet l'échange d'informations en temps réel et réduit significativement l'effort et le temps requis pour effectuer une réservation.

Paper Publications (2024) — Classroom Reservation System in Universities : Cette étude [2] insiste sur la nécessité d'une interface simple et intuitive réduisant le taux d'erreur lors de la saisie. Elle préconise des méthodes de réservation multiples (unitaire et récurrente), des interfaces personnalisées par rôle, et un module de statistiques d'utilisation pour les administrateurs.

ACM Digital Library (2024) — Cardinal Reserve : Un système de réservation en ligne pour un établissement d'enseignement supérieur [3], Cardinal Reserve, propose une architecture centrée sur l'expérience utilisateur (UX), avec des personas empathy maps pour chaque type d'acteur. Ce travail souligne l'importance de la co-conception avec les utilisateurs finaux pour maximiser l'adoption du système.
2.3 Détection de conflits et opérations atomiques
La détection des conflits de réservation est l'un des défis techniques centraux de tout système de réservation. La littérature récente identifie des lacunes récurrentes dans les implémentations existantes.

Analyse des lacunes selon TIJER (2026) — Hotel Room Booking System
L'étude de TIJER (février 2026) identifie six lacunes récurrentes dans les systèmes de réservation existants :
1. Absence de séparation architecturale claire entre présentation, logique métier et accès aux données
2. Validation enforced uniquement au niveau de l'interface utilisateur (côté client), contournable
3. Workflows de confirmation de réservation non atomiques — risque de double réservation sous charge
4. Détection insuffisante des chevauchements de créneaux horaires (overlapping room allocation)
5. Contrôle administrateur limité sur l'inventaire des salles
6. Gestion incohérente des annulations
→ Le SRIS adresse les points 1, 2, 3 et 4 par l'architecture MVT Django et la contrainte d'unicité en base.


La solution technique adoptée pour la détection de conflits repose sur une contrainte SQL au niveau de la base de données PostgreSQL, combinée à une validation côté serveur dans Django :

Algorithme de détection de conflits — Logique SQL
Pour valider une nouvelle réservation (salle S, date D, début H1, fin H2), la requête vérifie :

SELECT COUNT(*) FROM reservations
WHERE room_id = S
  AND date = D
  AND status != 'ANNULEE'
  AND start_time < H2
  AND end_time > H1

Si COUNT(*) > 0 → Conflit détecté → Exception levée → Réservation refusée avec message d'erreur explicite.
La condition (start_time < H2 AND end_time > H1) détecte tout chevauchement partiel ou total.
L'opération est exécutée dans une transaction atomique Django pour éviter les race conditions.

2.4 Contrôle d'accès basé sur les rôles (RBAC)
Le RBAC (Role-Based Access Control) est le modèle de contrôle d'accès le plus utilisé dans les applications web académiques. Son principe fondamental est défini par Ferraiolo et Sandhu (NIST, 1992) : les permissions sont associées à des rôles, et les utilisateurs acquièrent les permissions en étant membres des rôles appropriés.

Une étude sur les plateformes académiques (IJRTI, 2025) [5] conclut que l'implémentation de RBAC dans un LMS universitaire a réduit les modifications non autorisées de contenu de 60% et amélioré l'efficacité système de 75%. La même étude recommande un RBAC dynamique pour les utilisateurs à double rôle (ex: enseignant-chercheur).

Rôle	Permissions dans le SRIS	Restrictions
Étudiant	Consulter les salles disponibles, réserver une salle pour projet/groupe, voir/modifier/annuler ses propres réservations	Ne peut pas gérer les salles, ne voit pas les réservations des autres
Enseignant	Mêmes droits que l'étudiant + réserver pour des cours ou réunions pédagogiques, priorité sur certains créneaux	Ne peut pas valider les comptes ou supprimer les salles
Administration	Superviser toutes les réservations, générer des rapports d'utilisation, gérer les conflits signalés	Rôle de supervision, sans modification directe des salles
Administrateur système	Accès total : gestion des comptes, des salles, des réservations, de la base de données	Responsabilité totale sur la maintenance et la sécurité
2.5 Systèmes existants comparables
Plusieurs solutions commerciales et académiques permettent de positionner le SRIS dans l'écosystème des outils de réservation d'espaces.

Système	Type	Points forts vs SRIS
YAROOMS (2024)	Commercial SaaS	Intégration IoT (capteurs d'occupation), sync Office 365/Teams. SRIS : solution open-source adaptable sans licence.
Skedda	Commercial SaaS	Visualisation avancée, intégration calendriers. SRIS : contrôle total des données, hébergement interne possible.
Ad Astra (Higher Ed)	Spécialisé universités	Scheduling intelligence, analytics avancés. SRIS : léger, sans infrastructure cloud coûteuse.
ecobook (Education)	SaaS éducation	Intégration systèmes d'emploi du temps, mobile. SRIS : déploiement autonome, personnalisable.
SRIS (ce projet)	Open-source académique	Gratuit, hébergeable en interne, code maîtrisé, adapté au contexte marocain/francophone, extensible.
 
3. Positionnement Scientifique du Projet
3.1 Lacunes identifiées et réponses du projet
La revue de la littérature permet d'identifier précisément les lacunes auxquelles le SRIS apporte une réponse structurée.

Contribution originale du SRIS à trois niveaux
Niveau 1 — Technique : Implémentation d'une détection de conflits atomique au niveau base de données (contrainte SQL + transaction Django), garantissant l'intégrité même sous charge concurrente.
Niveau 2 — Architectural : Application rigoureuse du patron MVT Django avec séparation stricte modèles / vues / templates, RBAC natif via le système de permissions Django + django-allauth, et formulaires avec validation CSRF.
Niveau 3 — Pratique : Interface calendrier visuel par salle, tableau de bord d'administration avec statistiques d'utilisation, réinitialisation de mot de passe par email — fonctionnalités directement opérationnelles pour une université.

3.2 Justification scientifique des choix technologiques

Choix technique	Justification dans la littérature	Alternative écartée et raison
Django MVT (Python)	Architecture éprouvée pour les applications web à forte logique métier. ORM Django protège nativement contre les injections SQL. Communauté active et documentation exhaustive.	Flask : trop minimaliste pour un système avec RBAC, formulaires complexes et gestion de sessions. Spring Boot : surcharge Java non adaptée au profil Python du projet.
PostgreSQL	Base relationnelle robuste pour les contraintes d'intégrité (UNIQUE sur créneaux). Transactions ACID garantissant l'atomicité des réservations concurrentes.	SQLite : non adapté à la production multi-utilisateurs. MongoDB : modèle NoSQL inadapté aux relations strictes de réservation.
RBAC via Django permissions	Système de permissions Django nativement intégré, éprouvé dans les études sur les LMS universitaires (IJRTI, 2025). Réduit les erreurs d'implémentation vs un RBAC custom.	ABAC (Attribute-Based) : plus flexible mais complexité accrue non justifiée pour 4 rôles fixes.
Bootstrap 5 + Django Templates	Responsive design natif pour tous les navigateurs. Intégration naturelle avec le système de templating Django. Réduction du temps de développement frontend.	React.js + API : complexité full-stack non justifiée pour une application MVT standard sans besoin de SPA.
django-allauth	Bibliothèque standard pour l'authentification avancée (reset password par email, vérification email). Maintenu activement. Compatible Django 4.x.	Implémentation custom : risque de failles de sécurité. Solution recommandée par la documentation officielle Django.
 
4. Architecture et Conception du Système
4.1 Architecture MVT Django
Le SRIS suit l'architecture MVT (Model-View-Template) de Django, qui constitue une adaptation du patron MVC (Model-View-Controller) pour le développement web Python.

Architecture MVT — Rôles et responsabilités
Model (models.py) : Définit les entités User, Room, Booking. Gère la persistance en base PostgreSQL via l'ORM Django. Contient la logique de validation des données et les contraintes d'intégrité.
View (views.py) : Contient la logique métier. Traite les requêtes HTTP, applique les permissions RBAC, orchestre les appels aux modèles, et retourne les réponses (templates ou redirections).
Template (templates/) : Pages HTML rendues côté serveur. Reçoit le contexte des vues. Utilise le langage de template Django (héritage, blocks, filtres) pour éviter la duplication de code.
URL Router (urls.py) : Fait correspondre chaque URL à la vue appropriée. Point d'entrée pour toutes les requêtes HTTP.
Forms (forms.py) : Validation des données saisies par l'utilisateur. Protection CSRF automatique sur tous les formulaires POST.
Admin (admin.py) : Interface d'administration générée automatiquement par Django pour les modèles enregistrés.

4.2 Modélisation des données
Le système repose sur trois entités principales reliées par des clés étrangères :

Entité / Modèle	Attributs et contraintes
User (CustomUser)	id (PK), username, email (UNIQUE), password (hashé bcrypt), role (ETUDIANT | ENSEIGNANT | ADMIN | ADMIN_SYS), is_active, date_joined
Room (Salle)	id (PK), name (UNIQUE), capacity (Integer), equipment (TextField JSON), is_active (Boolean), building (CharField optionnel)
Booking (Réservation)	id (PK), user (FK→User), room (FK→Room), date (DateField), start_time (TimeField), end_time (TimeField), status (EN_ATTENTE | CONFIRMEE | ANNULEE), purpose (CharField), created_at
Contrainte d'unicité	UNIQUE TOGETHER (room, date, start_time) pour éviter les doubles réservations au niveau base de données. Validation complémentaire dans la vue via la requête de détection de conflits.
4.3 Flux de réservation — Logique métier
Le flux complet d'une réservation implique plusieurs étapes de validation en cascade :
3.	L'utilisateur sélectionne une salle, une date et un créneau dans l'interface calendrier.
4.	Le formulaire Django vérifie la validité des données (champs requis, cohérence heure début/fin, date non passée).
5.	La vue Django exécute la requête de détection de conflits dans une transaction atomique (select_for_update()).
6.	Si conflit → message d'erreur explicite affiché + redirection vers le calendrier. Si libre → réservation créée en base avec statut EN_ATTENTE.
7.	Notification optionnelle à l'administration pour confirmation (selon la configuration). Mise à jour immédiate du calendrier visuel.
4.4 Structure du projet Django

Organisation des fichiers
sris/                          ← Dossier racine du projet
├── sris/                      ← Configuration principale
│   ├── settings.py            ← Config DB, apps installées, sécurité
│   ├── urls.py                ← Routage URL principal
│   └── wsgi.py                ← Point d'entrée WSGI (déploiement)
├── users/                     ← App gestion des utilisateurs
│   ├── models.py              ← CustomUser avec champ role
│   ├── views.py               ← Login, logout, register, profil
│   ├── forms.py               ← Formulaires inscription/connexion
│   └── templates/users/       ← login.html, register.html, profil.html
├── rooms/                     ← App gestion des salles
│   ├── models.py              ← Room avec capacity, equipment, is_active
│   ├── views.py               ← CRUD salles (admin uniquement)
│   └── templates/rooms/       ← list.html, detail.html, form.html
├── bookings/                  ← App réservations (cœur du système)
│   ├── models.py              ← Booking avec détection de conflits
│   ├── views.py               ← Créer, modifier, annuler, calendrier
│   ├── forms.py               ← BookingForm avec validation temporelle
│   └── templates/bookings/    ← calendar.html, dashboard.html
├── templates/                 ← Templates partagés (base.html, navbar)
├── static/                    ← CSS, JS, Bootstrap 5
├── requirements.txt           ← Dépendances Python
└── manage.py                  ← CLI Django

 
5. État d'Avancement et Planning
5.1 Répartition des tâches

Tâche	Responsable	Statut
Setup projet Django, virtualenv, PostgreSQL, structure apps	Salma & Fatine	À faire
Modèles User, Room, Booking + migrations + Django Admin	Salma	À faire
Système d'authentification (login, logout, register, reset password)	Fatine	À faire
CRUD salles (admin) + filtres capacité/équipements/disponibilité	Salma	À faire
Logique de réservation + détection de conflits atomique	Salma & Fatine	À faire
Calendrier visuel des réservations par salle (FullCalendar.js)	Fatine	À faire
Dashboard administration (statistiques, supervision)	Salma	À faire
Tests unitaires (TestCase Django) — 15 tests minimum	Salma & Fatine	À faire
Responsive design Bootstrap 5 + templates complets	Fatine	À faire
Déploiement production (PythonAnywhere ou Railway)	Salma & Fatine	À faire
5.2 Planning détaillé — 10 semaines

Semaine	Objectif	Livrable
S1	Setup complet : venv, Django, PostgreSQL, structure apps, GitHub	python manage.py runserver fonctionne, repo GitHub créé
S2	Modèles User/Room/Booking + migrations + Django Admin configuré	Admin Django accessible, 3 salles créées en base
S3	Authentification complète : register, login, logout, reset password par email	Inscription/connexion fonctionnelle pour les 4 rôles
S4	CRUD salles + filtres disponibilité/capacité/équipements	Liste des salles filtrable, CRUD réservé aux admins
S5	Logique de réservation + détection de conflits + formulaire validé	Réservation créée, conflit détecté et bloqué correctement
S6	Calendrier visuel (FullCalendar.js) + dashboard utilisateur	Calendrier affiche les réservations par salle en temps réel
S7	Dashboard administration + statistiques d'utilisation	Tableau de bord admin avec statistiques hebdomadaires
S8	Tests unitaires (15+) + sécurité (CSRF, validation, permissions)	python manage.py test — tout vert
S9	Responsive Bootstrap 5 + polish interface + corrections bugs	Interface validée sur mobile et desktop
S10	Déploiement production + documentation utilisateur + README	URL publique fonctionnelle, README complet
5.3 Stack technique complète

Couche	Technologies
Langage & Framework	Python 3.12 · Django 4.x (architecture MVT) · Django ORM
Base de données	PostgreSQL 16 (production) · SQLite (développement) · psycopg2
Frontend	HTML5 · CSS3 · JavaScript ES6+ · Bootstrap 5 · FullCalendar.js (calendrier)
Authentification	Django Authentication System · django-allauth (reset password, email)
Sécurité	Tokens CSRF Django · Protection SQL via ORM · RBAC via Django permissions
Tests	Django TestCase · Tests unitaires et d'intégration
Déploiement	Gunicorn · PythonAnywhere ou Railway · Whitenoise (static files)
Outils développement	Visual Studio Code · Git / GitHub · draw.io / StarUML (UML) · Chrome DevTools
 
6. Bibliographie Scientifique
Articles de recherche — Références principales

[1] IEEE Xplore. (2021). Design and Development of an Integrated Room Reservation System for Higher Education Institutions. IEEE Conference Publication. Étude conduite dans une université des Philippines documentant la transition d'un système manuel à un système web de gestion des ressources en temps réel. URL : https://ieeexplore.ieee.org/document/9436766/

[2] Paper Publications. (2023-2024). Application and Implementation of Classroom Reservation System in Universities. Vol. 10, Issue 2, pp. 45-52, octobre 2023 – mars 2024. Étude sur la conception d'interfaces ergonomiques pour systèmes de réservation de micro-salles en université. URL : https://www.paperpublications.org

[3] ACM Digital Library. (2024). Cardinal Reserve: A Proposed Online Room Reservation System for a Higher Educational Institution (HEI). Proceedings of the 2024 6th International Conference on Management Science and Industrial Engineering. DOI : https://dl.acm.org/doi/10.1145/3664968.3664982

[4] TIJER. (2026). Hotel Room Booking and Management System — Layered Architecture and Conflict Detection. TIJER, ISSN 2349-9249, Vol. 13, Issue 2, février 2026. Analyse des lacunes des systèmes existants et proposition d'une architecture à couches avec validation atomique. URL : https://tijer.org/tijer/papers/TIJER2602115.pdf

[5] IJRTI. (2025). Implementing Role-Based Access Control (RBAC) in Academic Social Platforms. Étude démontrant une réduction de 60% des modifications non autorisées et une amélioration de 75% de l'efficacité système après implémentation RBAC dans un LMS universitaire. URL : https://www.ijrti.org/papers/IJRTI2505044.pdf

[6] Singh, J., Rani, S. & Kumar, V. (2024). Role-Based Access Control (RBAC) Enabled Secure and Efficient Data Processing Framework for IoT Networks. International Journal of Communication Networks and Information Security (IJCNIS), Vol. 16(2), pp. 19-32. Analyse comparative RBAC vs ABAC : RBAC reste efficace et scalable pour les grandes bases d'utilisateurs en 2024. URL : https://www.researchgate.net/publication/383295659

[7] IntechOpen. (2023). A Systematic Review on IoT-Based Smart Technologies for Seat Occupancy and Reservation Needs in Smart Libraries. Revue systématique 2016-2022 couvrant les technologies IoT appliquées aux systèmes de réservation intelligente dans les établissements d'enseignement supérieur. URL : https://www.intechopen.com/chapters/88506

[8] Ferraiolo, D. & Kuhn, R. (1992). Role-Based Access Controls. Proceedings of the 15th NIST-NCSC National Computer Security Conference. Article fondateur définissant le modèle RBAC standard, cité dans toute la littérature sur le contrôle d'accès. Référence de base pour l'implémentation RBAC du SRIS.

[9] IEEE Xplore. (2012). Roles-based Access Control Modeling and Testing for Web Applications. IEEE Conference Publication. Propose une approche de modélisation et test du RBAC dynamique pour les applications web, prenant en compte l'évolution des rôles et permissions au cours du temps. URL : https://ieeexplore.ieee.org/document/6394924/

[10] Hwang, K., Jung, I.H. & Lee, J.M. (2022). Design And Implementation Of Database For Shared Facility Reservation System In School. Journal of Positive School Psychology, 6(8), 7033-7041. Étude sur la modélisation de base de données pour systèmes de réservation de ressources partagées en milieu scolaire.
Références techniques officielles

[T1] Django Project. (2024). Django Documentation v4.x. https://docs.djangoproject.com/fr/4.2/

[T2] Django Allauth. (2024). Django Allauth Documentation. https://docs.allauth.org/en/latest/

[T3] Bootstrap. (2024). Bootstrap 5 Documentation. https://getbootstrap.com/docs/5.3/

[T4] FullCalendar. (2024). FullCalendar JavaScript Event Calendar. https://fullcalendar.io/docs

[T5] PostgreSQL. (2024). PostgreSQL 16 Documentation. https://www.postgresql.org/docs/16/
 
7. Perspectives et Améliorations Futures
7.1 Limites de la version initiale
•	Pas de gestion des récurrences : les réservations hebdomadaires répétées doivent être saisies manuellement.
•	Pas d'intégration avec les systèmes d'emploi du temps existants (import/export iCal ou API EDT).
•	Notifications par email non implémentées en v1 (confirmations automatiques, rappels).
•	Pas de capteurs d'occupation réels (IoT) — la disponibilité repose uniquement sur les réservations enregistrées.
7.2 Roadmap d'évolution

Évolution	Apport et justification scientifique
v2 — Réservations récurrentes	Permettre les réservations hebdomadaires récurrentes avec gestion automatique des conflits sur toute la période. Besoin identifié dans Paper Publications (2024) [2].
v2 — Notifications email automatiques	Envoi de confirmations, rappels 24h avant et alertes d'annulation via Celery + Redis. Améliore significativement l'expérience utilisateur.
v3 — Intégration calendrier iCal	Export/import au format iCalendar (.ics) pour synchronisation avec Google Calendar, Outlook. Standard RFC 5545.
v3 — API REST (Django REST Framework)	Exposition d'une API REST pour permettre des intégrations avec d'autres systèmes universitaires (portail étudiant, application mobile).
v4 — IoT & capteurs d'occupation	Intégration de capteurs de présence pour libérer automatiquement les salles non occupées (feature commerciale YAROOMS, Yealink). Sujet de recherche actif [7].
v4 — Recommandation intelligente de salle	Suggestion automatique de salle en fonction du nombre de participants, des équipements requis et des préférences historiques — extension IA du SRIS.

Note des auteures
Ce document constitue la présentation académique initiale du projet SRIS, accompagnant le cahier des charges fourni. Il sera complété au fil du développement par les résultats de tests, les captures d'écran de l'interface et les métriques de performance (temps de réponse, charge simultanée d'utilisateurs).
Salma Karim & Fatine Elbari — Année universitaire 2025-2026



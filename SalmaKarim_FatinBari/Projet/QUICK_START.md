# Quick Start - SRIS

## Lancement rapide

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

## Acces

- application: [http://127.0.0.1:8000/login/](http://127.0.0.1:8000/login/)
- administration: [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)
- API REST: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

## Comptes de demo

- `admin / admin123`
- `fatine / password123`
- `salma / password123`
- `youssef / password123`

## Tests

```bash
python manage.py check
python manage.py test
```

## Parcours de demo conseille

1. Se connecter avec `salma`
2. Consulter les salles
3. Creer une reservation
4. Ouvrir le calendrier
5. Se connecter avec `admin`
6. Superviser les reservations dans le dashboard et dans `/admin/`

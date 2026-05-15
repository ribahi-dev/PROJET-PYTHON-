import os
from urllib.parse import parse_qs, urlparse


def env_bool(name, default=False):
    return os.getenv(name, str(default)).strip().lower() in {'1', 'true', 'yes', 'on'}


def env_list(name, default=''):
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(',') if item.strip()]


def env_int(name, default=0):
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def build_database_config(base_dir):
    database_url = os.getenv('DATABASE_URL', '').strip()
    if not database_url:
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': base_dir / 'db.sqlite3',
            }
        }

    parsed = urlparse(database_url)
    scheme = parsed.scheme.lower()

    if scheme == 'sqlite':
        sqlite_path = parsed.path.replace('/', '', 1) or 'db.sqlite3'
        return {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': base_dir / sqlite_path,
            }
        }

    if scheme in {'postgres', 'postgresql'}:
        options = parse_qs(parsed.query)
        return {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': parsed.path.lstrip('/'),
                'USER': parsed.username or '',
                'PASSWORD': parsed.password or '',
                'HOST': parsed.hostname or '',
                'PORT': parsed.port or '',
                'CONN_MAX_AGE': env_int('DB_CONN_MAX_AGE', 60),
                'OPTIONS': {
                    key: values[-1]
                    for key, values in options.items()
                    if values
                },
            }
        }

    raise ValueError(f'Schema DATABASE_URL non supporte: {scheme}')

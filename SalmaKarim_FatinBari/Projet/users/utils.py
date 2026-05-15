import re
import unicodedata

from django.contrib.auth import get_user_model


User = get_user_model()


def normalize_email(value):
    return (value or '').strip().lower()


def slugify_username(seed):
    normalized = unicodedata.normalize('NFKD', seed or '').encode('ascii', 'ignore').decode('ascii')
    slug = re.sub(r'[^a-zA-Z0-9]+', '.', normalized).strip('.').lower()
    return slug or 'emsi.user'


def build_unique_username(email='', first_name='', last_name=''):
    local_part = email.split('@', 1)[0] if email and '@' in email else ''
    candidate = slugify_username(local_part or f'{first_name}.{last_name}')
    base = candidate[:140]
    username = base
    index = 1

    while User.objects.filter(username__iexact=username).exists():
        suffix = f'.{index}'
        username = f'{base[:150 - len(suffix)]}{suffix}'
        index += 1

    return username

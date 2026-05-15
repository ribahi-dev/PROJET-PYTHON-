from datetime import datetime

from django.core.exceptions import ValidationError

from sris.models import AppSetting


DEFAULTS = {
    'MAX_BOOKING_DAYS': 45,
    'MIN_BOOKING_DURATION': 30,
    'MAX_BOOKING_DURATION': 240,
    'WORKDAY_START_HOUR': 8,
    'WORKDAY_END_HOUR': 20,
}


def get_setting_value(key):
    setting = AppSetting.objects.filter(key=key, is_active=True).values_list('value', flat=True).first()
    if setting in (None, ''):
        return DEFAULTS[key]
    try:
        return int(setting)
    except (TypeError, ValueError):
        return DEFAULTS[key]


def validate_booking_rules(booking):
    if not booking.date or not booking.start_time or not booking.end_time:
        return

    max_days = get_setting_value('MAX_BOOKING_DAYS')
    min_duration = get_setting_value('MIN_BOOKING_DURATION')
    max_duration = get_setting_value('MAX_BOOKING_DURATION')
    workday_start = get_setting_value('WORKDAY_START_HOUR')
    workday_end = get_setting_value('WORKDAY_END_HOUR')

    advance_days = (booking.date - booking.date.today()).days
    if advance_days > max_days:
        raise ValidationError(f'Une reservation ne peut pas etre creee plus de {max_days} jours a l avance.')

    start_minutes = booking.start_time.hour * 60 + booking.start_time.minute
    end_minutes = booking.end_time.hour * 60 + booking.end_time.minute
    duration = end_minutes - start_minutes

    if duration < min_duration:
        raise ValidationError(f'La duree minimale d une reservation est de {min_duration} minutes.')

    if duration > max_duration:
        raise ValidationError(f'La duree maximale d une reservation est de {max_duration} minutes.')

    if booking.start_time.hour < workday_start or booking.end_time.hour > workday_end or (
        booking.end_time.hour == workday_end and booking.end_time.minute > 0
    ):
        raise ValidationError(
            f'Les reservations doivent rester entre {workday_start:02d}:00 et {workday_end:02d}:00.'
        )

from django import template

register = template.Library()

@register.filter
def category_color(category):
    colors = {
        'equitation': 'primary',
        'mer': 'info',
        'stage': 'warning'
    }
    return colors.get(category, 'secondary')

@register.filter
def category_name(category):
    names = {
        'equitation': 'Équitation',
        'mer': 'Balade en Mer',
        'stage': 'Stage'
    }
    return names.get(category, category)

@register.filter
def reservation_status_color(status):
    colors = {
        'en_attente': 'warning',
        'confirmee': 'success',
        'annulee': 'danger'
    }
    return colors.get(status, 'secondary')

@register.filter
def ticket_status_color(status):
    colors = {
        'valide': 'success',
        'utilise': 'info',
        'expire': 'danger'
    }
    return colors.get(status, 'secondary')

@register.filter
def filter_statut(queryset, statut):
    return queryset.filter(statut=statut)

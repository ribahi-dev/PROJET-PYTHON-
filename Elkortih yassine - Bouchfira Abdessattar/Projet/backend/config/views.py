from django.http import JsonResponse


def root_view(request):
    """Root API endpoint"""
    return JsonResponse({
        'message': 'Welcome to IdeaLab API',
        'version': '1.0.0',
        'endpoints': {
            'admin': '/admin/',
            'accounts': '/accounts/',
            'analytics': '/analytics/',
            'bookmarks': '/bookmarks/',
            'chatbot': '/chatbot/',
            'comments': '/comments/',
            'feedbacks': '/feedbacks/',
            'ideas': '/ideas/',
            'notifications': '/notifications/',
        }
    })

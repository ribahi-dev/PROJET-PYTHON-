from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission pour que seul le propriétaire puisse modifier ses données."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class IsStaffOrReadOnly(permissions.BasePermission):
    """Permission pour que seul le staff puisse modifier."""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsBookingOwnerOrStaff(permissions.BasePermission):
    """Permission pour les réservations."""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return obj.user == request.user or request.user.is_staff

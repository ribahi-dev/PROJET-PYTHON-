from rest_framework import serializers
from .models import Bookmark
from ideas.serializers import IdeaSerializer


class BookmarkSerializer(serializers.ModelSerializer):
    """
    Serializer pour les bookmarks.
    Inclut les détails de l'idée bookmarkée.
    """
    idea_details = IdeaSerializer(source='idea', read_only=True)
    
    class Meta:
        model = Bookmark
        fields = ['id', 'idea', 'idea_details', 'created_at']
        read_only_fields = ['id', 'created_at']


class BookmarkCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de bookmarks."""
    
    class Meta:
        model = Bookmark
        fields = ['idea']

    def validate_idea(self, value):
        """Validation : l'idée doit exister et être accessible."""
        if not value:
            raise serializers.ValidationError("L'idée spécifiée n'existe pas.")
        return value

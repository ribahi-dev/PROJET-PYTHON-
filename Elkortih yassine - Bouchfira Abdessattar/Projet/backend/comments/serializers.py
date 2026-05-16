from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer récursif pour afficher les threads de commentaires.
    - replies : liste des réponses imbriquées
    - author_name : nom de l'auteur
    - can_edit : permission de modification (24h)
    """
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'idea', 'author', 'author_name', 'author_avatar',
            'content', 'parent', 'is_deleted', 
            'created_at', 'updated_at', 'can_edit',
            'replies', 'replies_count'
        ]
        read_only_fields = ['id', 'author', 'is_deleted', 'created_at', 'updated_at']

    def get_author_avatar(self, obj):
        """Retourne l'URL de l'avatar si disponible."""
        try:
            if obj.author.userprofile.avatar:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.author.userprofile.avatar.url)
        except:
            pass
        return None

    def get_replies(self, obj):
        """Récursion : affiche les réponses imbriquées (non supprimées)."""
        if obj.is_deleted:
            return []
        replies = obj.replies.filter(is_deleted=False).select_related('author', 'author__userprofile')
        return CommentSerializer(replies, many=True, context=self.context).data

    def get_can_edit(self, obj):
        """Vérifie si l'utilisateur peut modifier (auteur + 24h)."""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user and obj.can_edit()

    def get_replies_count(self, obj):
        """Compte le nombre de réponses non supprimées."""
        return obj.replies.filter(is_deleted=False).count()


class CommentCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de commentaires."""
    
    class Meta:
        model = Comment
        fields = ['idea', 'content', 'parent']

    def validate_content(self, value):
        """Validation : contenu minimum 10 caractères."""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Le commentaire doit contenir au moins 10 caractères.")
        return value

    def validate_parent(self, value):
        """Validation : le parent doit appartenir à la même idée."""
        if value:
            idea = self.initial_data.get('idea')
            if str(value.idea.id) != str(idea):
                raise serializers.ValidationError("Le commentaire parent doit appartenir à la même idée.")
        return value

from rest_framework import serializers
from .models import Idea, Category, IdeaVersion
from accounts.serializers import UserSerializer


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug')


class IdeaVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = IdeaVersion
        fields = ('id', 'idea', 'version_number', 'data_snapshot', 'created_at')
        read_only_fields = ('id', 'created_at', 'version_number')


class IdeaSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    versions = IdeaVersionSerializer(source='ideaversion_set', many=True, read_only=True)

    class Meta:
        model = Idea
        fields = ('id', 'owner', 'title', 'description', 'sector', 'problem', 'solution', 'target', 'status', 'global_score', 'rejection_reason', 'versions', 'created_at')
        read_only_fields = ('id', 'owner', 'global_score', 'created_at')

    def create(self, validated_data):
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)

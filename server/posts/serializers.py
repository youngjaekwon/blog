from rest_framework import serializers

from .models import PostTag


class PostTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostTag
        fields = ["id", "name"]


class PostSerializer(serializers.ModelSerializer):
    tags = PostTagSerializer(many=True, read_only=True)

    class Meta:
        model = PostTag
        fields = "__all__"
        read_only_fields = ["id", "slug", "view_count"]

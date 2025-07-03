from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied

from .models import Comment, Post, PostTag


class PostTagSerializer(serializers.ModelSerializer):
    post_count = serializers.SerializerMethodField()

    class Meta:
        model = PostTag
        fields = ["id", "name", "slug", "post_count"]

    def get_post_count(self, obj):
        return obj.posts.filter(is_public=True, is_active=True).count()


class PostSerializer(serializers.ModelSerializer):
    tags = PostTagSerializer(many=True, read_only=True)

    class Meta:
        model = Post
        fields = "__all__"
        read_only_fields = ["id", "slug", "view_count"]


class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(min_length=1, max_length=255, required=False)
    password = serializers.CharField(min_length=4, max_length=30, write_only=True)
    content = serializers.CharField(min_length=1, max_length=2000)

    class Meta:
        model = Comment
        fields = ["id", "author", "password", "content", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data: dict[str, str]) -> Comment:
        post = self.context.get("post")
        if not post:
            raise AssertionError("Post must be provided via serializer context.")
        author = validated_data.get("author")
        content = validated_data.pop("content")
        password = validated_data.pop("password")

        return Comment.objects.create_comment(
            post=post, author=author, content=content, pw=password
        )

    def update(self, instance: Comment, validated_data: dict[str, str]) -> Comment:
        password = validated_data.pop("password", None)
        if password and not instance.check_password(password):
            raise PermissionDenied("Incorrect password")

        instance.author = validated_data.get("author", instance.author)
        instance.content = validated_data.get("content", instance.content)
        instance.save()
        return instance

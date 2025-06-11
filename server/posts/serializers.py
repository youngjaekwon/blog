from rest_framework import serializers

from .models import Comment, PostTag


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
            raise serializers.ValidationError("Post not found in context")
        author = validated_data.get("author")
        content = validated_data.pop("content")
        password = validated_data.pop("password")

        return Comment.objects.create_comment(
            post=post, author=author, content=content, pw=password
        )

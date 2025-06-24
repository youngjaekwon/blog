from functools import cached_property

from core.utils.ip import get_user_ip
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from posts.models import Comment, Post
from posts.schemas import comment_schema_view, post_schema_view
from posts.serializers import CommentSerializer, PostSerializer


@post_schema_view
class PostViewSet(ReadOnlyModelViewSet):
    queryset = Post.objects.public().prefetch_related("tags").all()
    serializer_class = PostSerializer

    filterset_fields = ["tags__name"]
    ordering_fields = ["created_at", "view_count"]
    search_fields = ["title", "content", "tags__name"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["get"], url_path=r"slug/<str:slug>")
    def get_by_slug(self, request: Request, slug: str):
        post = get_object_or_404(
            Post.objects.public().prefetch_related("tags"), slug=slug
        )
        hashed_ip = get_user_ip(request)
        post.increase_view_count_with_cache(hashed_ip=hashed_ip)

        serializer = self.get_serializer(post)
        return Response(serializer.data)


@comment_schema_view
class CommentViewSet(ModelViewSet):
    serializer_class = CommentSerializer

    ordering = ["-created_at"]

    @cached_property
    def post(self):
        post_id = self.kwargs.get("post_pk")
        return get_object_or_404(Post, id=post_id)

    def get_context_data(self, **kwargs):
        context = super().get_serializer_context()
        context["post"] = self.post
        return context

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Comment.objects.none()
        return self.post.comments.all()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        password = request.data.get("password")
        if not instance.check_password(password):
            return PermissionDenied("Incorrect password")

        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

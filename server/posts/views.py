from core.utils.ip import get_user_ip
from rest_framework.request import Request
from rest_framework.viewsets import ReadOnlyModelViewSet

from posts.models import Post
from posts.schemas import post_schema_view
from posts.serializers import PostSerializer


@post_schema_view
class PostViewSet(ReadOnlyModelViewSet):
    queryset = Post.objects.public().prefetch_related("tags").all()
    serializer_class = PostSerializer

    filterset_fields = ["tags__name"]
    ordering_fields = ["created_at", "view_count"]
    search_fields = ["title", "content", "tags__name"]
    ordering = ["-created_at"]

    def retrieve(self, request: Request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        post = self.get_object()
        hashed_ip = get_user_ip(request)
        post.increase_view_count_with_cache(hashed_ip=hashed_ip)
        return response

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

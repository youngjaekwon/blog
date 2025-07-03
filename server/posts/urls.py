from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from posts.views import CommentViewSet, PostViewSet, PostTagViewSet

app_name = "posts"

router = DefaultRouter()
router.register(r"posts", PostViewSet, basename="posts")
router.register(r"tags", PostTagViewSet, basename="tags")

posts_router = NestedDefaultRouter(router, r"posts", lookup="post")
posts_router.register(
    r"comments",
    CommentViewSet,
    basename="post-comments",
)
urlpatterns = router.urls
urlpatterns += posts_router.urls

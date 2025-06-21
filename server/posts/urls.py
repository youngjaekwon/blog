from rest_framework.routers import DefaultRouter

from posts.views import CommentViewSet, PostViewSet

app_name = "posts"

router = DefaultRouter()
router.register(r"", PostViewSet, basename="post")
router.register(
    r"<int:post_pk>/comments",
    CommentViewSet,
    basename="comment",
)
urlpatterns = router.urls

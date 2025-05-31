from rest_framework.routers import DefaultRouter

from posts.views import PostViewSet

app_name = "posts"

router = DefaultRouter()
router.register(r"", PostViewSet, basename="post")
urlpatterns = router.urls

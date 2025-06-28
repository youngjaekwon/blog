from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path(r"admin/", admin.site.urls),
    path(r"api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        r"api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(r"api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
    path(r"api/", include("posts.urls", namespace="posts")),
]

from django.contrib import admin

from .models import Post, PostTag


@admin.register(PostTag)
class PostTagAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "is_active", "view_count", "updated_at", "created_at"]
    list_filter = ["is_public", "is_active", "updated_at", "created_at"]
    search_fields = ["title", "slug", "content"]
    readonly_fields = ["view_count", "updated_at", "created_at"]
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)
    fieldsets = (
        (None, {"fields": ("title", "slug", "content", "tags", "is_public", "is_active")}),
        ("Metadata", {
            "fields": ("view_count", "updated_at", "created_at"),
        })
    )
    ordering = ("-created_at",)

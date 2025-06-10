from core.models import BaseModel, SoftDeleteManager
from django.core.cache import cache
from django.db import models
from django.utils.text import slugify


class PostTag(models.Model):
    name = models.CharField(max_length=255, unique=True, db_index=True)

    def __str__(self):
        return self.name


class PostManager(SoftDeleteManager):
    def public(self):
        return super().get_queryset().filter(is_public=True)


class Post(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    content = models.TextField()
    view_count = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=True)

    tags = models.ManyToManyField(PostTag, related_name="posts")

    objects = PostManager()

    class Meta:
        indexes = [
            models.Index(fields=["is_active", "title"]),
            models.Index(fields=["is_active", "slug"]),
            models.Index(fields=["is_active", "is_public"]),
            models.Index(fields=["is_active", "created_at"]),
        ]

    def _generate_unique_slug(self) -> str:
        base_slug = slugify(self.title, allow_unicode=True)
        slug = base_slug
        counter = 1
        while Post.objects.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._generate_unique_slug()
        super().save(*args, **kwargs)

    def increase_view_count(self):
        Post.objects.filter(id=self.id).update(view_count=models.F("view_count") + 1)
        self.refresh_from_db(fields=["view_count"])

    def increase_view_count_with_cache(
        self, hashed_ip: str | None = None, expire: int = 60 * 60 * 24
    ) -> None:
        if hashed_ip is None:
            return

        cache_key = f"post:{self.id}:view_count:{hashed_ip}"
        if not cache.get(cache_key):
            self.increase_view_count()
            cache.set(cache_key, True, timeout=expire)

from core.models import BaseModel
from django.db import models
from django.utils.text import slugify


class PostTag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Post(BaseModel):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)
    content = models.TextField()
    view_count = models.PositiveIntegerField(default=0)
    is_public = models.BooleanField(default=True)

    tags = models.ManyToManyField(PostTag, related_name="posts")

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
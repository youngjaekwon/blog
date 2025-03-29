from django.db import models
from django.utils import timezone


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

    def all_with_deleted(self):
        return super().get_queryset()

    def only_deleted(self):
        return self.all_with_deleted().filter(is_active=False)


class SoftDeleteModel(models.Model):
    is_active = models.BooleanField(default=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        if not self.is_active:
            return

        for rel in self._meta.get_fields():
            if (rel.one_to_many or rel.one_to_one or rel.many_to_many) and rel.auto_created:
                accessor_name = rel.get_accessor_name()
                related_objects = getattr(self, accessor_name, None)

                if related_objects is None:
                    continue

                if rel.one_to_one:
                    related_object = related_objects
                    if hasattr(related_object, "delete") and isinstance(related_object, SoftDeleteModel):
                        related_object.delete()
                else:
                    for related_object in related_objects.all():
                        if hasattr(related_object, "delete") and isinstance(related_object, SoftDeleteModel):
                            related_object.delete()

        self.is_active = False
        self.deleted_at = timezone.now()
        self.save(update_fields=["is_active", "deleted_at"])

    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


class BaseModel(SoftDeleteModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
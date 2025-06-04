from django.core.cache import cache

from posts.models import Post


def increase_view_count_with_cache(
    post: Post, hashed_ip: str | None = None, expire: int = 60 * 60 * 24
) -> None:
    if hashed_ip is None:
        return

    cache_key = f"post:{post.id}:view_count:{hashed_ip}"
    if not cache.get(cache_key):
        post.increase_view_count()
        cache.set(cache_key, True, timeout=expire)

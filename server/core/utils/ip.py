import hashlib

from rest_framework.request import Request


def get_user_ip(request: Request) -> str | None:
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        user_ip = x_forwarded_for.split(",")[0].strip()
    else:
        user_ip = request.META.get("REMOTE_ADDR")

    if not user_ip:
        return None

    return hashlib.sha256(user_ip.encode("utf-8")).hexdigest()

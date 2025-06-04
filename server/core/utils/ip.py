from rest_framework.request import Request


def get_user_ip(request: Request) -> str | None:
    user_ip = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
    user_ip = user_ip or request.META.get("REMOTE_ADDR", "")
    if user_ip == "":
        return None
    hashed_ip = hash(user_ip)
    return str(hashed_ip)

import hashlib

import pytest
from rest_framework.test import APIRequestFactory


@pytest.mark.parametrize(
    "meta, expected_ip",
    [
        ({"HTTP_X_FORWARDED_FOR": "1.2.3.4"}, "1.2.3.4"),
        ({"HTTP_X_FORWARDED_FOR": "1.2.3.4, 5,6,7,8"}, "1.2.3.4"),
        ({"REMOTE_ADDR": "5.6.7.8"}, "5.6.7.8"),
        ({}, "127.0.0.1"),
        ({"HTTP_X_FORWARDED_FOR": "", "REMOTE_ADDR": ""}, None),
    ],
)
def test_get_user_up(meta, expected_ip):
    """사용자 IP 주소를 가져오는 함수 테스트"""
    from core.utils.ip import get_user_ip

    # Given
    factory = APIRequestFactory()
    request = factory.get("/", **meta)

    # When
    hashed_ip = get_user_ip(request)

    # Then
    if expected_ip is None:
        assert hashed_ip is None
    else:
        expected_hashed_ip = hashlib.sha256(expected_ip.encode("utf-8")).hexdigest()
        assert hashed_ip == expected_hashed_ip

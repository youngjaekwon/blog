import pytest
from django.contrib.auth.hashers import check_password
from rest_framework import serializers


@pytest.mark.django_db
def test_comment_serializer_valid_data_creates_comment(post):
    """ "CommentSerializer가 유효한 데이터를 처리하여 Comment 객체를 생성하는지 테스트"""
    from posts.models import Comment
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "Jane Doe",
        "content": "A meaningful comment.",
        "password": "securepass",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})
    assert serializer.is_valid(), serializer.errors
    comment = serializer.save()

    # Then
    assert isinstance(comment, Comment)
    assert comment.post == post
    assert comment.author == data["author"]
    assert comment.content == data["content"]
    assert check_password(data["password"], comment.hashed_pw)


@pytest.mark.django_db
def test_comment_serializer_anonymous_author(post):
    """CommentSerializer가 익명 댓글 작성자를 처리하는지 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "content": "Anonymous comment.",
        "password": "anonpass",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})
    assert serializer.is_valid(), serializer.errors
    comment = serializer.save()

    # Then
    assert comment.author is None
    assert comment.content == data["content"]
    assert check_password(data["password"], comment.hashed_pw)


@pytest.mark.django_db
def test_comment_serializer_missing_post_context_raises_error():
    """CommentSerializer가 post context가 없을 때 ValidationError를 발생시키는지 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "NoContext",
        "content": "Comment without post.",
        "password": "pass1234",
    }

    # When
    serializer = CommentSerializer(data=data)

    # Then
    with pytest.raises(serializers.ValidationError) as e:
        serializer.is_valid(raise_exception=True)
        serializer.save()

    assert "Post not found in context" in str(e.value)


@pytest.mark.parametrize(
    "invalid_data,expected_error_key",
    [
        (
            {"author": "A", "password": "123", "content": "Valid content"},
            "password",
        ),  # 비밀번호가 짧은 경우
        (
            {"author": "A", "password": "123456", "content": ""},
            "content",
        ),  # 컨텐츠가 없는 경우
        (
            {"author": "A", "password": "p" * 31, "content": "Okay"},
            "password",
        ),  # 비밀번호가 너무 긴 경우
    ],
)
@pytest.mark.django_db
def test_comment_serializer_invalid_data(invalid_data, expected_error_key, post):
    """CommentSerializer가 유효하지 않은 데이터를 처리할 때 ValidationError를 발생시키는지 테스트"""
    from posts.serializers import CommentSerializer

    serializer = CommentSerializer(data=invalid_data, context={"post": post})
    assert not serializer.is_valid()
    assert expected_error_key in serializer.errors

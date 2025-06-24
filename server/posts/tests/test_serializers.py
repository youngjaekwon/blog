import pytest
from django.contrib.auth.hashers import check_password


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
    """CommentSerializer가 post context가 없을 때 AssertionError를 발생시키는지 테스트"""
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
    with pytest.raises(AssertionError) as e:
        serializer.is_valid(raise_exception=True)
        serializer.save()


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


@pytest.mark.django_db
def test_posttag_serializer_fields():
    """PostTagSerializer의 모든 필드 테스트"""
    from posts.factories import PostTagFactory
    from posts.serializers import PostTagSerializer

    # Given
    post_tag = PostTagFactory()

    # When
    serializer = PostTagSerializer(post_tag)

    # Then
    data = serializer.data
    assert "id" in data
    assert "name" in data
    assert data["id"] == post_tag.id
    assert data["name"] == post_tag.name


@pytest.mark.django_db
def test_posttag_serializer_validation():
    """PostTagSerializer의 validation 테스트"""
    from posts.serializers import PostTagSerializer

    # Given
    valid_data = {"name": "Valid Tag Name"}

    # When
    serializer = PostTagSerializer(data=valid_data)

    # Then
    assert serializer.is_valid()
    assert serializer.validated_data["name"] == valid_data["name"]


@pytest.mark.django_db
def test_posttag_serializer_invalid_data():
    """PostTagSerializer의 유효하지 않은 데이터 테스트"""
    from posts.serializers import PostTagSerializer

    # Given
    invalid_data = {"name": ""}  # 빈 문자열

    # When
    serializer = PostTagSerializer(data=invalid_data)

    # Then
    assert not serializer.is_valid()
    assert "name" in serializer.errors


@pytest.mark.django_db
def test_post_serializer_fields():
    """PostSerializer의 모든 필드 테스트"""
    from posts.factories import PostFactory
    from posts.serializers import PostSerializer

    # Given
    post = PostFactory()

    # When
    serializer = PostSerializer(post)

    # Then
    data = serializer.data
    assert "id" in data
    assert "title" in data
    assert data["id"] == post.id
    assert data["title"] == post.title


@pytest.mark.django_db
def test_post_serializer_read_only_fields():
    """PostSerializer의 read_only_fields 테스트"""
    from posts.factories import PostFactory
    from posts.serializers import PostSerializer

    # Given
    post = PostFactory()
    original_slug = post.slug
    original_view_count = post.view_count

    # When
    data = {
        "title": "Updated Title",
        "content": "Updated content",
        "slug": "updated-slug",  # read_only 필드
        "view_count": 999,  # read_only 필드
    }
    serializer = PostSerializer(post, data=data, partial=True)

    # Then
    assert serializer.is_valid()
    updated_post = serializer.save()
    assert updated_post.title == "Updated Title"
    assert updated_post.slug == original_slug  # 변경되지 않음
    assert updated_post.view_count == original_view_count  # 변경되지 않음


@pytest.mark.django_db
def test_post_serializer_tags_field():
    """PostSerializer의 tags 필드 테스트"""
    from posts.factories import PostFactory, PostTagFactory
    from posts.serializers import PostSerializer

    # Given
    tags = PostTagFactory.create_batch(3)
    post = PostFactory(tags=tags)

    # When
    serializer = PostSerializer(post)

    # Then
    data = serializer.data
    assert "tags" in data
    assert len(data["tags"]) == 3
    for i, tag_data in enumerate(data["tags"]):
        assert tag_data["id"] == tags[i].id
        assert tag_data["name"] == tags[i].name


@pytest.mark.django_db
def test_comment_serializer_update_success(comment):
    """CommentSerializer의 update 메서드 테스트 - 성공 케이스"""
    from posts.serializers import CommentSerializer

    # Given
    original_author = comment.author
    original_content = comment.content
    update_data = {
        "author": "Updated Author",
        "content": "Updated comment content",
        "password": "test1234",  # 올바른 비밀번호
    }

    # When
    serializer = CommentSerializer(comment, data=update_data, partial=True)
    assert serializer.is_valid()
    updated_comment = serializer.save()

    # Then
    assert updated_comment.author == "Updated Author"
    assert updated_comment.content == "Updated comment content"
    assert updated_comment.author != original_author
    assert updated_comment.content != original_content


@pytest.mark.django_db
def test_comment_serializer_update_wrong_password(comment):
    """CommentSerializer의 update 메서드 테스트 - 잘못된 비밀번호"""
    from rest_framework.exceptions import PermissionDenied

    from posts.serializers import CommentSerializer

    # Given
    update_data = {
        "author": "Updated Author",
        "content": "Updated comment content",
        "password": "wrongpassword",  # 잘못된 비밀번호
    }

    # When & Then
    serializer = CommentSerializer(comment, data=update_data, partial=True)
    assert serializer.is_valid()
    with pytest.raises(PermissionDenied, match="Incorrect password"):
        serializer.save()


@pytest.mark.django_db
def test_comment_serializer_update_partial_fields(comment):
    """CommentSerializer의 update 메서드 테스트 - 부분 필드 업데이트"""
    from posts.serializers import CommentSerializer

    # Given
    original_author = comment.author
    original_content = comment.content
    update_data = {
        "content": "Only content updated",
        "password": "test1234",
    }

    # When
    serializer = CommentSerializer(comment, data=update_data, partial=True)
    assert serializer.is_valid()
    updated_comment = serializer.save()

    # Then
    assert updated_comment.author == original_author  # 변경되지 않음
    assert updated_comment.content == "Only content updated"  # 변경됨


@pytest.mark.django_db
def test_comment_serializer_author_too_long(post):
    """CommentSerializer의 author 필드 길이 제한 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "A" * 256,  # 255자 초과
        "content": "Valid content",
        "password": "test1234",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})

    # Then
    assert not serializer.is_valid()
    assert "author" in serializer.errors


@pytest.mark.django_db
def test_comment_serializer_content_too_long(post):
    """CommentSerializer의 content 필드 길이 제한 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "Valid Author",
        "content": "A" * 2001,  # 2000자 초과
        "password": "test1234",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})

    # Then
    assert not serializer.is_valid()
    assert "content" in serializer.errors


@pytest.mark.django_db
def test_comment_serializer_author_min_length(post):
    """CommentSerializer의 author 필드 최소 길이 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "",  # 최소 길이 미달
        "content": "Valid content",
        "password": "test1234",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})

    # Then
    assert not serializer.is_valid()
    assert "author" in serializer.errors


@pytest.mark.django_db
def test_comment_serializer_content_min_length(post):
    """CommentSerializer의 content 필드 최소 길이 테스트"""
    from posts.serializers import CommentSerializer

    # Given
    data = {
        "author": "Valid Author",
        "content": "",  # 최소 길이 미달
        "password": "test1234",
    }

    # When
    serializer = CommentSerializer(data=data, context={"post": post})

    # Then
    assert not serializer.is_valid()
    assert "content" in serializer.errors

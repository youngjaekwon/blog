import pytest
from django.contrib.auth.hashers import check_password


@pytest.mark.django_db
def test_post_creation():
    """ "Post 모델의 생성 테스트"""
    from posts.models import Post

    # Given
    title = "Sample Post"
    content = "This is a sample post content."
    expected_slug = "sample-post"

    # When
    post = Post.objects.create(title=title, content=content, is_public=True)

    # Then
    assert post.title == title
    assert post.content == content
    assert post.slug == expected_slug


@pytest.mark.django_db
def test_post_slug_generation():
    """Post 모델의 슬러그 생성 테스트"""
    from posts.models import Post

    # Given
    title = "Test Post with Unique Slug"
    content = "This post should have a unique slug."

    # When
    post1 = Post.objects.create(title=title, content=content, is_public=True)
    post2 = Post.objects.create(title=title, content=content, is_public=True)

    # Then
    assert post1.slug != post2.slug
    assert post1.slug == "test-post-with-unique-slug"
    assert post2.slug == "test-post-with-unique-slug-1"


@pytest.mark.django_db
def test_post_with_tags(post):
    """Post 모델의 태그 설정 테스트"""
    from posts.models import PostTag

    # Given
    post_tag = PostTag.objects.create(name="New Tag")
    post_tag_count_before = post.tags.count()

    # When
    post.tags.add(post_tag)
    post.save()

    # Then
    assert post.tags.count() == post_tag_count_before + 1
    assert post.tags.filter(name=post_tag.name).exists()


@pytest.mark.django_db
def test_post_filtering_by_tags(posts, post_tags):
    """Post 모델의 태그를 기준으로 필터링 테스트"""
    from posts.models import Post

    # Given
    tag_name = post_tags[0].name

    # When
    filtered_posts = Post.objects.filter(tags__name=tag_name)

    # Then
    assert filtered_posts.count() > 0
    for post in filtered_posts:
        assert post.tags.filter(name=tag_name).exists()


@pytest.mark.django_db
def test_post_filtering_by_public(posts):
    """Post 모델의 공개 여부 필터링 테스트"""
    from posts.models import Post

    # Given
    posts[0].is_public = True
    posts[0].save()
    posts[1].is_public = False
    posts[1].save()
    posts[2].is_active = False
    posts[2].save()

    # When
    all_posts = Post.objects.all()
    public_posts = Post.objects.public()
    public_count = public_posts.count()
    private_count = all_posts.count() - public_count

    # Then
    assert public_count > 0
    assert private_count == 1


@pytest.mark.django_db
def test_post_view_count_increment(post):
    """Post 모델의 조회수 증가 테스트"""
    # Given
    initial_view_count = post.view_count

    # When
    post.increase_view_count()

    # Then
    assert post.view_count == initial_view_count + 1


@pytest.mark.django_db
def test_post_view_count_with_cache(post, mocker):
    """Post 모델의 조회수 증가 캐시 테스트"""

    # Given
    initial_view_count = post.view_count
    hashed_ip = "test_hashed_ip"

    # Mock the cache set method
    mock_cache_get = mocker.patch("posts.models.cache.get", return_value=None)
    mock_cache_set = mocker.patch("posts.models.cache.set")

    # When
    post.increase_view_count_with_cache(hashed_ip=hashed_ip)

    # Then
    assert post.view_count == initial_view_count + 1
    mock_cache_get.assert_called_once_with(f"post:{post.id}:view_count:{hashed_ip}")
    mock_cache_set.assert_called_once_with(
        f"post:{post.id}:view_count:{hashed_ip}", True, timeout=60 * 60 * 24
    )


@pytest.mark.django_db
def test_post_view_count_with_cache_no_ip(post, mocker):
    """Post 모델의 조회수 증가 캐시 테스트 (IP 없음)"""

    # Given
    initial_view_count = post.view_count

    # Mock the cache set method
    mock_cache_set = mocker.patch("posts.models.cache.set")

    # When
    post.increase_view_count_with_cache(hashed_ip=None)

    # Then
    assert post.view_count == initial_view_count
    mock_cache_set.assert_not_called()


@pytest.mark.django_db
def test_post_view_count_with_cache_existing_cache(post, mocker):
    """Post 모델의 조회수 증가 캐시 테스트 (캐시가 이미 존재하는 경우)"""

    # Given
    initial_view_count = post.view_count
    hashed_ip = "test_hashed_ip"

    # Mock the cache get method to return a value
    mock_cache_get = mocker.patch("posts.models.cache.get", return_value=True)

    # When
    post.increase_view_count_with_cache(hashed_ip=hashed_ip)
    post.refresh_from_db(fields=["view_count"])

    # Then
    assert post.view_count == initial_view_count
    mock_cache_get.assert_called_once_with(f"post:{post.id}:view_count:{hashed_ip}")


@pytest.mark.django_db
def test_comment_creation_via_manager(post):
    """CommentManager를 통한 댓글 생성 테스트"""
    from posts.models import Comment

    # Given
    author = "Test Author"
    content = "This is a comment."
    password = "test1234"

    # When
    comment = Comment.objects.create_comment(
        post=post,
        author=author,
        content=content,
        pw=password,
    )

    # Then
    assert comment.author == author
    assert comment.content == content
    assert check_password(password, comment.hashed_pw)
    assert comment.post == post


@pytest.mark.django_db
def test_comment_factory_default(comment):
    """CommentFactory를 통한 기본 댓글 생성 테스트"""

    # When

    # Then
    assert comment.post is not None
    assert comment.author is not None
    assert comment.content
    assert comment.hashed_pw.startswith("pbkdf2_")  # Django 기본 해시 방식


@pytest.mark.django_db
def test_comment_check_password_success(comment):
    """Comment 모델의 비밀번호 확인 테스트 - 일치하는 경우"""
    assert comment.check_password("test1234") is True


@pytest.mark.django_db
def test_comment_check_password_failure(comment):
    """Comment 모델의 비밀번호 확인 테스트 - 불일치하는 경우"""
    assert comment.check_password("wrongpw") is False


@pytest.mark.django_db
def test_posttag_creation():
    """PostTag 모델의 생성 테스트"""
    from posts.models import PostTag

    # Given
    tag_name = "Test Tag"

    # When
    post_tag = PostTag.objects.create(name=tag_name)

    # Then
    assert post_tag.name == tag_name
    assert post_tag.id is not None


@pytest.mark.django_db
def test_posttag_str_method():
    """PostTag 모델의 __str__ 메서드 테스트"""
    from posts.models import PostTag

    # Given
    tag_name = "Test Tag"
    post_tag = PostTag.objects.create(name=tag_name)

    # When
    str_representation = str(post_tag)

    # Then
    assert str_representation == tag_name


@pytest.mark.django_db
def test_posttag_unique_constraint():
    """PostTag 모델의 unique constraint 테스트"""
    from django.db import IntegrityError

    from posts.models import PostTag

    # Given
    tag_name = "Unique Tag"
    PostTag.objects.create(name=tag_name)

    # When & Then
    with pytest.raises(IntegrityError):
        PostTag.objects.create(name=tag_name)


@pytest.mark.django_db
def test_posttag_factory():
    """PostTagFactory를 통한 PostTag 생성 테스트"""
    from posts.factories import PostTagFactory

    # Given & When
    post_tag = PostTagFactory()

    # Then
    assert post_tag.name is not None
    assert "Tag" in post_tag.name
    assert post_tag.id is not None


@pytest.mark.django_db
def test_posttag_slug_auto_generation_without_providing_slug():
    """PostTag 생성 시 슬러그를 전달하지 않아도 정상적으로 생성되는지 테스트"""
    from posts.models import PostTag

    # Given
    tag_name = "Python Programming"

    # When
    post_tag = PostTag.objects.create(name=tag_name)

    # Then
    assert post_tag.name == tag_name
    assert post_tag.slug == "python-programming"
    assert post_tag.slug is not None
    assert len(post_tag.slug) > 0


@pytest.mark.django_db
def test_posttag_slug_generation_with_utf8_characters():
    """PostTag의 이름을 utf-8 문자로 생성 시 슬러그가 정상적으로 생성되는지 테스트"""
    from posts.models import PostTag

    # Given
    korean_tag_name = "파이썬 프로그래밍"
    japanese_tag_name = "プログラミング"
    emoji_tag_name = "🐍 Python"

    # When
    korean_tag = PostTag.objects.create(name=korean_tag_name)
    japanese_tag = PostTag.objects.create(name=japanese_tag_name)
    emoji_tag = PostTag.objects.create(name=emoji_tag_name)

    # Then
    assert korean_tag.name == korean_tag_name
    assert korean_tag.slug == "파이썬-프로그래밍"
    assert korean_tag.slug is not None

    assert japanese_tag.name == japanese_tag_name
    assert japanese_tag.slug == "プログラミング"
    assert japanese_tag.slug is not None

    assert emoji_tag.name == emoji_tag_name
    assert emoji_tag.slug == "python"  # 이모지는 slugify에서 제거됨
    assert emoji_tag.slug is not None


@pytest.mark.django_db
def test_posttag_slug_no_duplicate_error_with_emoji_removal():
    """포스트 태그의 이름을 이모지를 포함하여 생성 시 슬러그 함수가 이모지를 삭제해도 슬러그가 중복으로 인해 에러가 발생하지 않는지 테스트"""
    from posts.models import PostTag

    # Given
    tag_name1 = "🐍 Python"
    tag_name2 = "Python"  # 이모지가 제거되면 같은 슬러그가 될 수 있음

    # When - 순서대로 생성
    tag1 = PostTag.objects.create(name=tag_name1)
    tag2 = PostTag.objects.create(name=tag_name2)

    # Then - 두 태그 모두 성공적으로 생성되어야 함
    assert tag1.name == tag_name1
    assert tag1.slug == "python"

    assert tag2.name == tag_name2
    assert tag2.slug == "python-1"  # 중복 방지를 위해 숫자가 추가됨

    # 두 태그의 slug가 달라야 함
    assert tag1.slug != tag2.slug

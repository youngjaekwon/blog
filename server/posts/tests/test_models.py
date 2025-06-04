import pytest


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


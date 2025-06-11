import random

import pytest


@pytest.fixture
def post_tags():
    from posts.factories import PostTagFactory

    tags = PostTagFactory.create_batch(3)

    return tags


@pytest.fixture
def post(post_tags):
    from posts.factories import PostFactory

    post = PostFactory(tags=post_tags)

    return post


@pytest.fixture
def posts(post_tags):
    from posts.factories import PostFactory

    posts = []
    tag_pool = post_tags[1:]
    tag_pool_len = len(tag_pool)
    for _ in range(5):
        if tag_pool_len > 0:
            k = random.randint(1, tag_pool_len)
            sampled_tags = [post_tags[0]] + random.sample(tag_pool, k=k)
        else:
            sampled_tags = [post_tags[0]]
        post = PostFactory(tags=sampled_tags)
        posts.append(post)

    return posts


@pytest.fixture
def comment(post):
    from posts.factories import CommentFactory

    comment = CommentFactory(post=post)

    return comment

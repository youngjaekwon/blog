import factory
from django.contrib.auth.hashers import make_password
from factory.django import DjangoModelFactory

from posts.models import Comment, Post, PostTag


class PostTagFactory(DjangoModelFactory):
    class Meta:
        model = PostTag

    name = factory.Sequence(lambda n: f"Tag {n}")


class PostFactory(DjangoModelFactory):
    class Meta:
        model = Post

    title = factory.Sequence(lambda n: f"Post Title {n}")
    content = factory.Faker("text")
    is_public = True

    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        if not create:
            return

        if extracted:
            for tag in extracted:
                self.tags.add(tag)
        else:
            for _ in range(3):
                tag = PostTagFactory()
                self.tags.add(tag)


class CommentFactory(DjangoModelFactory):
    class Meta:
        model = Comment

    post = factory.SubFactory(PostFactory)
    author = factory.Faker("name")
    content = factory.Faker("sentence")
    hashed_pw = factory.LazyFunction(lambda: make_password("test1234"))

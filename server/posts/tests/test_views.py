import json
from unittest.mock import patch

import pytest
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status

from posts.factories import CommentFactory, PostFactory, PostTagFactory
from posts.models import Comment, PostTag


@pytest.mark.django_db
class TestPostViewSet:
    """PostViewSet 테스트"""

    def setup_method(self):
        """각 테스트 메소드 실행 전 설정"""
        cache.clear()
        # 포스트 조회수 초기화 (테스트 격리를 위해)
        if hasattr(self, 'public_post1'):
            self.public_post1.view_count = 0
            self.public_post1.save(update_fields=['view_count'])
        if hasattr(self, 'public_post2'):
            self.public_post2.view_count = 0
            self.public_post2.save(update_fields=['view_count'])
        if hasattr(self, 'private_post'):
            self.private_post.view_count = 0
            self.private_post.save(update_fields=['view_count'])

    @pytest.fixture(autouse=True)
    def setup_test_data(self, client):
        """테스트 데이터 설정"""
        self.client = client

        # 공개 포스트들 생성
        self.tag1 = PostTagFactory(name="Python")
        self.tag2 = PostTagFactory(name="Django")

        self.public_post1 = PostFactory(
            title="Public Post 1",
            content="Public content 1",
            is_public=True,
            tags=[self.tag1],
        )
        self.public_post2 = PostFactory(
            title="Public Post 2",
            content="Public content 2",
            is_public=True,
            tags=[self.tag2],
        )

        # 비공개 포스트 생성
        self.private_post = PostFactory(
            title="Private Post",
            content="Private content",
            is_public=False,
            tags=[self.tag1],
        )

    def test_list_posts_success(self):
        """포스트 목록 조회 성공 테스트"""
        url = reverse("posts:posts-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 2  # 공개 포스트만 조회

        # 비공개 포스트는 조회되지 않음
        titles = [post["title"] for post in response.data["results"]]
        assert "Private Post" not in titles

    def test_list_posts_with_tag_filter(self):
        """태그 필터링 테스트"""
        url = reverse("posts:posts-list")
        response = self.client.get(url, {"tags__name": "Python"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["title"] == "Public Post 1"

    def test_list_posts_with_ordering(self):
        """정렬 기능 테스트"""
        url = reverse("posts:posts-list")

        # created_at 역순 정렬 (기본)
        response = self.client.get(url, {"ordering": "-created_at"})
        assert response.status_code == status.HTTP_200_OK

        # view_count 정렬
        response = self.client.get(url, {"ordering": "view_count"})
        assert response.status_code == status.HTTP_200_OK

    def test_list_posts_with_search(self):
        """검색 기능 테스트"""
        url = reverse("posts:posts-list")

        # 제목 검색
        response = self.client.get(url, {"search": "Public Post 1"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

        # 내용 검색
        response = self.client.get(url, {"search": "content 2"})
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1

    def test_retrieve_post_success(self):
        """포스트 상세 조회 성공 테스트"""
        url = reverse("posts:posts-detail", kwargs={"pk": self.public_post1.pk})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Public Post 1"
        assert len(response.data["tags"]) == 1

    def test_retrieve_private_post_not_found(self):
        """비공개 포스트 조회 시 404 테스트"""
        url = reverse("posts:posts-detail", kwargs={"pk": self.private_post.pk})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch("posts.views.get_user_ip")
    def test_get_by_slug_success(self, mock_get_ip):
        """슬러그로 포스트 조회 및 조회수 증가 테스트"""
        mock_get_ip.return_value = "hashed_ip_123"

        # URL을 직접 빌드 (reverse가 작동하지 않는 경우)
        url = f"/api/posts/slug/{self.public_post1.slug}/"
        initial_view_count = self.public_post1.view_count

        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Public Post 1"

        # 조회수 증가 확인
        self.public_post1.refresh_from_db()
        assert self.public_post1.view_count == initial_view_count + 1

        # 캐시로 인한 중복 증가 방지 확인
        response = self.client.get(url)
        self.public_post1.refresh_from_db()
        assert self.public_post1.view_count == initial_view_count + 1

    def test_get_by_slug_not_found(self):
        """존재하지 않는 슬러그 조회 시 404 테스트"""
        url = "/api/posts/slug/nonexistent-slug/"
        response = self.client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch("posts.views.get_user_ip")
    def test_get_by_slug_no_ip_no_view_increase(self, mock_get_ip):
        """IP가 없을 때 조회수 증가하지 않음 테스트"""
        mock_get_ip.return_value = None

        url = f"/api/posts/slug/{self.public_post1.slug}/"
        initial_view_count = self.public_post1.view_count

        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        self.public_post1.refresh_from_db()
        assert self.public_post1.view_count == initial_view_count


@pytest.mark.django_db
class TestCommentViewSet:
    """CommentViewSet 테스트"""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, client):
        """테스트 데이터 설정"""
        self.client = client
        self.post = PostFactory()
        self.comment = CommentFactory(post=self.post, hashed_pw="hashed_test_password")

        # URL 패턴 설정
        self.list_url = reverse(
            "posts:post-comments-list", kwargs={"post_pk": self.post.pk}
        )
        self.detail_url = reverse(
            "posts:post-comments-detail",
            kwargs={"post_pk": self.post.pk, "pk": self.comment.pk},
        )

    def test_list_comments_success(self):
        """댓글 목록 조회 성공 테스트"""
        response = self.client.get(self.list_url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 1
        assert response.data["results"][0]["content"] == self.comment.content

    def test_list_comments_nonexistent_post(self):
        """존재하지 않는 포스트의 댓글 조회 시 404 테스트"""
        url = reverse("posts:post-comments-list", kwargs={"post_pk": 99999})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_create_comment_success(self):
        """댓글 생성 성공 테스트"""
        data = {
            "author": "Test Author",
            "content": "Test comment content",
            "password": "test1234",
        }

        response = self.client.post(self.list_url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["author"] == "Test Author"
        assert response.data["content"] == "Test comment content"
        assert "password" not in response.data  # 비밀번호는 응답에 포함되지 않음

        # DB에 저장되었는지 확인
        assert Comment.objects.filter(post=self.post, author="Test Author").exists()

    def test_create_comment_invalid_data(self):
        """댓글 생성 시 유효하지 않은 데이터 테스트"""
        # 비밀번호 누락
        data = {"author": "Test Author", "content": "Test comment content"}

        response = self.client.post(self.list_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # 내용 누락
        data = {"author": "Test Author", "password": "test1234"}

        response = self.client.post(self.list_url, data, format="json")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_create_comment_without_author(self):
        """작성자 없이 댓글 생성 테스트"""
        data = {"content": "Anonymous comment", "password": "test1234"}

        response = self.client.post(self.list_url, data, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["author"] is None

    def test_retrieve_comment_success(self):
        """댓글 상세 조회 성공 테스트"""
        response = self.client.get(self.detail_url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data["content"] == self.comment.content

    @patch("posts.models.Comment.check_password")
    def test_update_comment_success(self, mock_check_password):
        """댓글 수정 성공 테스트"""
        mock_check_password.return_value = True

        data = {
            "author": "Updated Author",
            "content": "Updated content",
            "password": "test1234",
        }

        response = self.client.put(
            self.detail_url, 
            data=json.dumps(data), 
            content_type="application/json"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["author"] == "Updated Author"
        assert response.data["content"] == "Updated content"

    @patch("posts.models.Comment.check_password")
    def test_update_comment_wrong_password(self, mock_check_password):
        """댓글 수정 시 잘못된 비밀번호 테스트"""
        mock_check_password.return_value = False

        data = {
            "author": "Updated Author",
            "content": "Updated content",
            "password": "wrong_password",
        }

        response = self.client.put(
            self.detail_url, 
            data=json.dumps(data), 
            content_type="application/json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    @patch("posts.models.Comment.check_password")
    def test_delete_comment_success(self, mock_check_password):
        """댓글 삭제 성공 테스트"""
        mock_check_password.return_value = True
        
        data = {"password": "test1234"}
        response = self.client.delete(
            self.detail_url, 
            data=json.dumps(data), 
            content_type="application/json"
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # 소프트 삭제 확인
        self.comment.refresh_from_db()
        assert not self.comment.is_active

    @patch("posts.models.Comment.check_password")
    def test_delete_comment_wrong_password(self, mock_check_password):
        """댓글 삭제 시 잘못된 비밀번호 테스트"""
        mock_check_password.return_value = False
        
        data = {"password": "wrong_password"}
        response = self.client.delete(
            self.detail_url, 
            data=json.dumps(data), 
            content_type="application/json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

        # 삭제되지 않았는지 확인
        self.comment.refresh_from_db()
        assert self.comment.is_active

    def test_delete_comment_no_password(self):
        """댓글 삭제 시 비밀번호 누락 테스트"""
        response = self.client.delete(
            self.detail_url, 
            data=json.dumps({}), 
            content_type="application/json"
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_queryset_with_swagger_fake_view(self):
        """Swagger fake view 테스트"""
        from posts.views import CommentViewSet

        # Swagger fake view 시뮬레이션
        viewset = CommentViewSet()
        viewset.swagger_fake_view = True

        queryset = viewset.get_queryset()
        assert not queryset.exists()


@pytest.mark.django_db
class TestViewSetEdgeCases:
    """ViewSet 엣지 케이스 테스트"""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, client):
        self.client = client

    def test_post_queryset_only_active_posts(self):
        """활성 포스트만 조회되는지 테스트"""
        # 비활성 포스트 생성
        inactive_post = PostFactory(is_active=False, is_public=True)
        active_post = PostFactory(is_active=True, is_public=True)

        url = reverse("posts:posts-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK

        # 활성 포스트만 조회되는지 확인
        post_ids = [post["id"] for post in response.data["results"]]
        assert active_post.id in post_ids
        assert inactive_post.id not in post_ids

    def test_comment_ordering(self):
        """댓글 정렬 테스트"""
        post = PostFactory()
        comment1 = CommentFactory(post=post)
        comment2 = CommentFactory(post=post)

        url = reverse("posts:post-comments-list", kwargs={"post_pk": post.pk})
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK

        # created_at 역순으로 정렬되는지 확인
        comments = response.data["results"]
        assert len(comments) == 2
        assert comments[0]["id"] == comment2.id  # 나중에 생성된 댓글이 먼저
        assert comments[1]["id"] == comment1.id


@pytest.mark.django_db
class TestPostTagViewSet:
    """PostTagViewSet 테스트"""

    @pytest.fixture(autouse=True)
    def setup_test_data(self, client):
        """테스트 데이터 설정"""
        self.client = client

        # 태그들 생성
        self.tag1 = PostTagFactory(name="Python")
        self.tag2 = PostTagFactory(name="Django")
        self.tag3 = PostTagFactory(name="JavaScript")

        # 포스트들 생성 (태그별 포스트 개수 테스트용)
        self.post1 = PostFactory(
            title="Python Post 1", is_public=True, tags=[self.tag1]
        )
        self.post2 = PostFactory(
            title="Python Post 2", is_public=True, tags=[self.tag1]
        )
        self.post3 = PostFactory(title="Django Post", is_public=True, tags=[self.tag2])
        # 비공개 포스트 (태그별 포스트 개수에 포함되지 않아야 함)
        self.private_post = PostFactory(
            title="Private Python Post", is_public=False, tags=[self.tag1]
        )

    def test_should_return_all_tags_with_post_counts_when_tags_exist(self):
        """태그가 존재할 때 태그 목록과 포스트 개수를 반환해야 함"""
        url = reverse("posts:tags-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3

        # 태그별 포스트 개수 확인
        tag_data = {tag["name"]: tag["post_count"] for tag in response.data["results"]}
        assert tag_data["Python"] == 2  # 공개 포스트 2개만 카운트
        assert tag_data["Django"] == 1
        assert tag_data["JavaScript"] == 0

        # 태그명으로 정렬되는지 확인
        tag_names = [tag["name"] for tag in response.data["results"]]
        assert tag_names == ["Django", "JavaScript", "Python"]

    def test_should_return_empty_list_when_no_tags_exist(self):
        """태그가 존재하지 않을 때 빈 목록을 반환해야 함"""
        # 모든 태그와 포스트 삭제
        PostTag.objects.all().delete()
        
        url = reverse("posts:tags-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_should_filter_posts_by_tag_slug_successfully(self):
        """태그 슬러그로 포스트 필터링이 성공해야 함"""
        # 태그에 slug가 있다고 가정하고 테스트 작성
        python_tag = PostTag.objects.get(name="Python")
        python_slug = "python"  # 태그 슬러그 예상값
        
        # 포스트 목록 URL에 태그 슬러그 필터 추가
        url = reverse("posts:posts-list")
        response = self.client.get(url, {"tags__slug": python_slug})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 2  # Python 태그가 있는 공개 포스트 2개
        
        # 반환된 포스트들이 모두 Python 태그를 가지고 있는지 확인
        for post in response.data["results"]:
            tag_names = [tag["name"] for tag in post["tags"]]
            assert "Python" in tag_names

    def test_should_return_empty_result_when_filtering_by_nonexistent_tag_slug(self):
        """존재하지 않는 태그 슬러그로 필터링 시 빈 결과를 반환해야 함"""
        url = reverse("posts:posts-list")
        response = self.client.get(url, {"tags__slug": "nonexistent-tag"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_should_exclude_private_posts_from_tag_filtering(self):
        """태그 필터링에서 비공개 포스트가 제외되어야 함"""
        url = reverse("posts:posts-list")
        response = self.client.get(url, {"tags__slug": "python"})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 2  # 공개 포스트만 2개

        # 비공개 포스트가 결과에 포함되지 않았는지 확인
        post_titles = [post["title"] for post in response.data["results"]]
        assert "Private Python Post" not in post_titles

        # 공개 포스트만 포함되었는지 확인
        assert "Python Post 1" in post_titles
        assert "Python Post 2" in post_titles

    def test_should_return_slug_when_retrieving_tags(self):
        """포스트 태그 조회 시 슬러그가 정상적으로 반환되는지 테스트"""
        url = reverse("posts:tags-list")
        response = self.client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) > 0

        # 모든 태그에 slug 필드가 포함되어 있는지 확인
        for tag in response.data["results"]:
            assert "slug" in tag
            assert tag["slug"] is not None
            assert len(tag["slug"]) > 0
            
        # 특정 태그의 slug 값 확인
        python_tag = next((tag for tag in response.data["results"] if tag["name"] == "Python"), None)
        assert python_tag is not None
        assert python_tag["slug"] == "python"

from drf_spectacular.utils import (
    OpenApiResponse,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status

from posts.serializers import PostSerializer

post_list_schema = extend_schema(
    summary="게시글 목록 조회",
    description="게시글 목록을 조회합니다.",
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            response=PostSerializer(many=True), description="게시글 목록"
        ),
    },
    parameters=[],
)

post_retrieve_schema = extend_schema(
    summary="게시글 상세 조회",
    description="게시글의 상세 정보를 조회합니다.",
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            response=PostSerializer(), description="게시글 상세 정보"
        ),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(description="게시글을 찾을 수 없음"),
    },
)

post_schema_view = extend_schema_view(
    list=post_list_schema,
    retrieve=post_retrieve_schema,
)

comment_list_schema = extend_schema(
    summary="댓글 목록 조회",
    description="게시글에 대한 댓글 목록을 조회합니다.",
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            response=PostSerializer(many=True), description="댓글 목록"
        ),
    },
    parameters=[],
)

comment_create_schema = extend_schema(
    summary="댓글 작성",
    description="게시글에 댓글을 작성합니다.",
    responses={
        status.HTTP_201_CREATED: OpenApiResponse(
            response=PostSerializer(), description="댓글 작성 성공"
        ),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(description="잘못된 요청"),
    },
    parameters=[],
)

comment_update_schema = extend_schema(
    summary="댓글 수정",
    description="게시글에 작성된 댓글을 수정합니다.",
    responses={
        status.HTTP_200_OK: OpenApiResponse(
            response=PostSerializer(), description="댓글 수정 성공"
        ),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(description="댓글을 찾을 수 없음"),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(description="잘못된 요청"),
    },
    parameters=[],
)

comment_delete_schema = extend_schema(
    summary="댓글 삭제",
    description="게시글에 작성된 댓글을 삭제합니다.",
    responses={
        status.HTTP_204_NO_CONTENT: OpenApiResponse(description="댓글 삭제 성공"),
        status.HTTP_404_NOT_FOUND: OpenApiResponse(description="댓글을 찾을 수 없음"),
    },
    parameters=[],
)

comment_schema_view = extend_schema_view(
    list=comment_list_schema,
    create=comment_create_schema,
    update=comment_update_schema,
    destroy=comment_delete_schema,
)

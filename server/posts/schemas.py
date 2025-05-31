from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
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

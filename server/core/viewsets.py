from rest_framework import status, viewsets
from rest_framework.request import Request
from rest_framework.response import Response


class SoftDeleteModelViewSet(viewsets.ModelViewSet):
    def destroy(self, request: Request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
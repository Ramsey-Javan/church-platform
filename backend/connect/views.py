from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import ConnectCardSerializer


class ConnectCardCreateAPIView(generics.CreateAPIView):
	"""Public connect card submission endpoint protected by Turnstile."""
	serializer_class = ConnectCardSerializer
	permission_classes = [AllowAny]

	def create(self, request, *args, **kwargs):
		serializer = self.get_serializer(data=request.data)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response({'detail': 'Connect card submitted.'}, status=status.HTTP_201_CREATED)

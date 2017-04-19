from rest_framework import viewsets
from rest_framework.response import Response
from .serializer import *


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class GenreViewSet(viewsets.ModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer


class OnomatopoeiaViewSet(viewsets.ModelViewSet):
    queryset = Onomatopoeia.objects.all()
    serializer_class = OnomatopoeiaSerializer


class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer


class OnomatopoeiaCountViewSet(viewsets.ModelViewSet):
    queryset = OnomatopoeiaCount.objects.all()
    serializer_class = OnomatopoeiaCountSerializer


class MovieAddViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieAddSerializer

    def create(self, request, *args, **kwargs):
        if request.method == 'POST':
            serializer = MovieAddSerializer(data={'id': request.POST['id'], 'name': request.POST['name']})
            print(serializer.is_valid())
            print(request.POST['id'])
            print(request.POST['name'])
            return Response(request.data)

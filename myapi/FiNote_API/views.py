from rest_framework import viewsets

from .models import User, Genre, Onomatopoeia, Movie, OnomatopoeiaCount
from .serializer import UserSerializer, GenreSerializer, OnomatopoeiaSerializer,\
                        MovieSerializer, OnomatopoeiaCountSerializer
import logging


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



# ロガーインスタンスを取得
logger = logging.getLogger('myapi')

def index(request):
    logger.info( "LogTEST：OK！" )

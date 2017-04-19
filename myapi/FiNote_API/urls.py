from rest_framework import routers
from .views import UserViewSet, GenreViewSet, OnomatopoeiaViewSet, MovieViewSet, OnomatopoeiaCountViewSet


router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'genres', GenreViewSet)
router.register(r'onomatopoeias', OnomatopoeiaViewSet)
router.register(r'movies', MovieViewSet)
router.register(r'onomatopoeiacounts', OnomatopoeiaCountViewSet)

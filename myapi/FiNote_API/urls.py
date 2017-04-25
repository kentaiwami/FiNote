from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'signin', SignInViewSet, 'signin')
router.register(r'signupwithtoken', SignUpWithTokenViewSet, 'signupwithtoken')
router.register(r'movieadd', MovieAddViewSet, 'movieadd')
router.register(r'onomatopoeiaupdate', OnomatopoeiaUpdateViewSet, 'onomatopoeiaupdate')
router.register(r'deletebackup', DeleteBackupViewSet, 'deletebackup')
# router.register(r'users', UserViewSet)
# router.register(r'genres', GenreViewSet)
# router.register(r'onomatopoeias', OnomatopoeiaViewSet)
# router.register(r'movies', MovieViewSet)
# router.register(r'onomatopoeiacounts', OnomatopoeiaCountViewSet)

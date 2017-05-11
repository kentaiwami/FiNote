from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'signup', SignUpViewSet, 'signup')
router.register(r'signinwithtoken', SignInWithTokenViewSet, 'signinwithtoken')
router.register(r'signinnotoken', SignInNoTokenViewSet, 'signinnotoken')
router.register(r'changepassword', ChangePasswordViewSet, 'changepassword')
router.register(r'changeemail', ChangeEmailViewSet, 'changeemail')
router.register(r'movieadd', MovieAddViewSet, 'movieadd')
router.register(r'onomatopoeiaupdate', OnomatopoeiaUpdateViewSet, 'onomatopoeiaupdate')
router.register(r'statusupdate', StatusUpdateViewSet, 'statusupdate')
router.register(r'deletebackup', DeleteBackupViewSet, 'deletebackup')
# router.register(r'users', UserViewSet)
# router.register(r'genres', GenreViewSet)
# router.register(r'onomatopoeias', OnomatopoeiaViewSet)
# router.register(r'movies', MovieViewSet)
# router.register(r'onomatopoeiacounts', OnomatopoeiaCountViewSet)

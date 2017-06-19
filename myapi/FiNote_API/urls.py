from rest_framework import routers
from .views import *

router = routers.DefaultRouter()
router.register(r'v1/signup', SignUpViewSet, 'signup')
router.register(r'v1/sign_in_with_token', SignInWithTokenViewSet, 'sign_in_with_token')
router.register(r'v1/sign_in_no_token', SignInNoTokenViewSet, 'sign_in_no_token')
router.register(r'v1/update_password', UpdatePasswordViewSet, 'update_password')
router.register(r'v1/update_email', UpdateEmailViewSet, 'update_email')
router.register(r'v1/update_sex', UpdateSexViewSet, 'update_sex')
router.register(r'v1/update_profile_img', UpdateProfileImgViewSet, 'update_profile_img')
router.register(r'v1/add_movie', AddMovieViewSet, 'add_movie')
router.register(r'v1/update_onomatopoeia', UpdateOnomatopoeiaViewSet, 'update_onomatopoeia')
router.register(r'v1/update_status', UpdateStatusViewSet, 'update_status')
router.register(r'v1/delete_backup', DeleteBackupViewSet, 'delete_backup')
router.register(r'v1/get_users', GetUsersViewSet, 'get_users')
router.register(r'v1/get_genres', GetGenresViewSet, 'get_genres')
router.register(r'v1/get_onomatopoeia', GetOnomatopoeiaViewSet, 'get_onomatopoeia')
router.register(r'v1/get_movies', GetMoviesViewSet, 'get_movies')
router.register(r'v1/get_onomatopoeia_count', GetOnomatopoeiaCountViewSet, 'get_onomatopoeia_count')
router.register(r'v1/get_recently_movie', GetRecentlyMovieViewSet, 'get_recently_movie')
router.register(r'v1/get_movie_by_age', GetMovieByAgeViewSet, 'get_movie_by_age')
router.register(r'v1/get_movie_reaction', GetMovieReactionViewSet, 'get_movie_reaction')
router.register(r'v1/get_movie_by_onomatopoeia', GetMovieByOnomatopoeiaViewSet, 'get_movie_by_onomatopoeia')
router.register(r'v1/get_movie_by_id', GetMovieByIDViewSet, 'get_movie_by_id')

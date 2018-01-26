from rest_framework import routers
from FiNote_API.v1.user_views import *
from FiNote_API.v1.movie_views import *

router = routers.DefaultRouter()
router.register(r'user/signup', SignUpUserViewSet, base_name='sign-up-user')
router.register(r'user/signin', SignInUserViewSet, base_name='sign-in-user')

router.register(r'user/update/password', UpdatePasswordViewSet, base_name='update-password')
router.register(r'user/update/email', UpdateEmailViewSet, base_name='update-email')


router.register(r'movie', AddMovieViewSet, base_name='add-movie')
router.register(r'movie/detail', GetMovieViewSet, base_name='get-movie')
router.register(r'movie/update', UpdateMovieUserInformationViewSet, base_name='update-movie')
router.register(r'movie/delete', DeleteMovieViewSet, 'delete-movie')

router.register(r'movie/recently', GetRecentlyMovieViewSet, 'get-recently-movie')
router.register(r'movie/byage', GetMovieByAgeViewSet, 'get-movie-by-age')
router.register(r'movie/compare', GetOnomatopoeiaComparisonViewSet, 'get-movie-compare')
router.register(r'movie/onomatopoeia/contain', GetMovieOnomatopoeiaContainViewSet, 'get-movie-onomatopoeia-contain')

router.register(r'movie/search/titles', GetSearchMovieTitleViewSet, 'get-movie-title')
router.register(r'movie/search/origin', GetOriginalTitleViewSet, 'get-movie-origin-title')


router.register(r'movies', GetMoviesViewSet, base_name='get-movies')
router.register(r'onomatopoeia/choice', GetOnomatopoeiaChoiceViewSet, base_name='get-onomatopoeia-choice')

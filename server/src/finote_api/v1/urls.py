from rest_framework import routers
from finote_api.v1.user_views import *
from finote_api.v1.movie_views import *

router = routers.DefaultRouter()
router.register(r'user/signup', SignUpUserViewSet, basename='sign-up-user')
router.register(r'user/signin', SignInUserViewSet, basename='sign-in-user')

router.register(r'user/update/password', UpdatePasswordViewSet, basename='update-password')
router.register(r'user/update/email', UpdateEmailViewSet, basename='update-email')
router.register(r'user/update/birthyear', UpdateBirthYearViewSet, basename='update-birth')


router.register(r'movie', AddMovieViewSet, basename='add-movie')
router.register(r'movie/detail', GetMovieViewSet, basename='get-movie')
router.register(r'movie/update', UpdateMovieUserInformationViewSet, basename='update-movie')
router.register(r'movie/delete', DeleteMovieViewSet, 'delete-movie')

router.register(r'movie/recently', GetRecentlyMovieViewSet, 'get-recently-movie')
router.register(r'movie/byage', GetMovieByAgeViewSet, 'get-movie-by-age')
router.register(r'movie/compare', GetOnomatopoeiaComparisonViewSet, 'get-movie-compare')
router.register(r'movie/onomatopoeia/contain', GetMovieOnomatopoeiaContainViewSet, 'get-movie-onomatopoeia-contain')

router.register(r'movie/search/titles', GetSearchMovieTitleViewSet, 'get-movie-title')
router.register(r'movie/search/origin', GetOriginalTitleViewSet, 'get-movie-origin-title')


router.register(r'movies', GetMoviesViewSet, basename='get-movies')
router.register(r'onomatopoeia/choice', GetOnomatopoeiaChoiceViewSet, basename='get-onomatopoeia-choice')

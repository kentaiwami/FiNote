from rest_framework import routers
from FiNote_API.v1.user_views import *
from FiNote_API.v1.movie_views import *

router = routers.DefaultRouter()
router.register(r'user', CreateUserViewSet, base_name='create-user')
router.register(r'user/update/password', UpdatePasswordViewSet, base_name='update-password')
router.register(r'user/update/email', UpdateEmailViewSet, base_name='update-email')
router.register(r'user/update/img', UpdateProfileImgViewSet, base_name='update-profile-img')


router.register(r'movie', AddMovieViewSet, base_name='add-movie')
router.register(r'movie/update/dvdfav', UpdateDVDFAVViewSet, base_name='update-dvdfav')
router.register(r'movie/update/onomatopoeia', UpdateOnomatopoeiaViewSet, base_name='update-onomatopoeia')
router.register(r'movie/delete', DeleteMovieViewSet, 'delete-movie')
router.register(r'movie/recently', GetRecentlyMovieViewSet, 'get-recently-movie')

router.register(r'movies', GetMoviesViewSet, base_name='get-movies')




# router.register(r'v1/get_movie_by_age', GetMovieByAgeViewSet, 'get_movie_by_age')
# router.register(r'v1/get_movie_reaction', GetMovieReactionViewSet, 'get_movie_reaction')
# router.register(r'v1/get_movie_by_onomatopoeia', GetMovieByOnomatopoeiaViewSet, 'get_movie_by_onomatopoeia')
# router.register(r'v1/get_search_movie_title_results', GetSearchMovieTitleResultsViewSet, 'get_search_movie_title_results')
# router.register(r'v1/get_original_title', GetOriginalTitleViewSet, 'get_original_title')
# router.register(r'v1/get_onomatopoeia_count_by_movie_id', GetOnomatopoeiaCountByMovieIDViewSet, 'get_onomatopoeia_count_by_movie_id')


# router.register(r'v1/get_users', GetUsersViewSet, 'get_users')
# router.register(r'v1/get_genres', GetGenresViewSet, 'get_genres')
# router.register(r'v1/get_onomatopoeia', GetOnomatopoeiaViewSet, 'get_onomatopoeia')
# router.register(r'v1/get_movies', GetMoviesViewSet, 'get_movies')
# router.register(r'v1/get_onomatopoeia_count', GetOnomatopoeiaCountViewSet, 'get_onomatopoeia_count')
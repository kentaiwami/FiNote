from rest_framework import routers
from FiNote_API.v1.user_views import *
from FiNote_API.v1.movie_views import *

router = routers.DefaultRouter()
router.register(r'user', CreateUserViewSet, 'create-user')
router.register(r'user/login', LoginViewSet, 'login')
router.register(r'user/update/password', UpdatePasswordViewSet, 'update-password')
router.register(r'user/update/email', UpdateEmailViewSet, 'update-email')
# router.register(r'v1/update_profile_img', UpdateProfileImgViewSet, 'update_profile_img')


# router.register(r'v1/user/signin/token', SignInWithTokenViewSet, 'sign_in_with_token')
# router.register(r'v1/user/signin/notoken', SignInNoTokenViewSet, 'sign_in_no_token')
# router.register(r'v1/add_movie', AddMovieViewSet, 'add_movie')
# router.register(r'v1/update_onomatopoeia', UpdateOnomatopoeiaViewSet, 'update_onomatopoeia')
# router.register(r'v1/update_status', UpdateStatusViewSet, 'update_status')
# router.register(r'v1/delete_backup', DeleteBackupViewSet, 'delete_backup')
# router.register(r'v1/get_users', GetUsersViewSet, 'get_users')
# router.register(r'v1/get_genres', GetGenresViewSet, 'get_genres')
# router.register(r'v1/get_onomatopoeia', GetOnomatopoeiaViewSet, 'get_onomatopoeia')
# router.register(r'v1/get_movies', GetMoviesViewSet, 'get_movies')
# router.register(r'v1/get_onomatopoeia_count', GetOnomatopoeiaCountViewSet, 'get_onomatopoeia_count')
# router.register(r'v1/get_recently_movie', GetRecentlyMovieViewSet, 'get_recently_movie')
# router.register(r'v1/get_movie_by_age', GetMovieByAgeViewSet, 'get_movie_by_age')
# router.register(r'v1/get_movie_reaction', GetMovieReactionViewSet, 'get_movie_reaction')
# router.register(r'v1/get_movie_by_onomatopoeia', GetMovieByOnomatopoeiaViewSet, 'get_movie_by_onomatopoeia')
# router.register(r'v1/get_movie_by_id', GetMovieByIDViewSet, 'get_movie_by_id')
# router.register(r'v1/get_search_movie_title_results', GetSearchMovieTitleResultsViewSet, 'get_search_movie_title_results')
# router.register(r'v1/get_original_title', GetOriginalTitleViewSet, 'get_original_title')
# router.register(r'v1/get_onomatopoeia_count_by_movie_id', GetOnomatopoeiaCountByMovieIDViewSet, 'get_onomatopoeia_count_by_movie_id')

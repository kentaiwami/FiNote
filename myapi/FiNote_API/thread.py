# import threading
# from django.core.exceptions import ObjectDoesNotExist
# from FiNote_API import Movie, OnomatopoeiaCount, Onomatopoeia
#
#
# class GetMovieReactionThread(threading.Thread):
#     """
#     This class is used GetMovieReaction API.
#     """
#
#     def __init__(self, tmdb_id):
#         """
#         :param tmdb_id: Target movie's tmdb_id.
#
#         :type tmdb_id int
#         """
#         super(GetMovieReactionThread, self).__init__()
#         self.tmdb_id = tmdb_id
#         self.result = {'init': 0}
#
#     def run(self):
#         """
#         If success search, this method appends tmdb_id and onomatopoeia name objects.
#         :return:
#         """
#         print('start: ', self.tmdb_id)
#
#         onomatopoeia_counts = []
#         try:
#             movie = Movie.objects.get(tmdb_id=self.tmdb_id)
#             some_onomatopoeia = movie.onomatopoeia.all()
#
#             for onomatopoeia in some_onomatopoeia:
#                 onomatopoeia_counts.append({"name": onomatopoeia.name})
#
#             self.result = {str(self.tmdb_id): onomatopoeia_counts}
#
#         except ObjectDoesNotExist:
#             pass
#
#         print('end: ', self.tmdb_id)
#
#     def getResult(self):
#         """
#         This method returns result list([{"1234":[{"name": "xxx"}, {"name": "yyy"},...]).
#         :return: Result list.
#         """
#         return self.result
#
#
# class GetOnomatopoeiaCountByMovieIDThread(threading.Thread):
#     """
#     This class is used GetOnomatopoeiaCountByMovieID API.
#     """
#
#     def __init__(self, movie, onomatopoeia_name_list):
#         """
#         :param movie: Search target movie.
#         :param onomatopoeia_name_list: Search onomatopoeia name list. ex.) [xxx,yyy,zzz]
#
#         :type movie: Movie
#         :type onomatopoeia_name_list list
#         """
#         super(GetOnomatopoeiaCountByMovieIDThread, self).__init__()
#         self.movie = movie
#         self.onomatopoeia_name_list = onomatopoeia_name_list
#         self.result = []
#
#     def run(self):
#         """
#         If success search, this method appends onomatopoeia and count objects({"name":"xxx", "count":y}).
#         """
#
#         for onomatopoeia_name in self.onomatopoeia_name_list:
#             try:
#                 onomatopoeia = Onomatopoeia.objects.get(name=onomatopoeia_name)
#                 count = OnomatopoeiaCount.objects.filter(movie=self.movie, onomatopoeia=onomatopoeia).count()
#
#                 self.result.append({"name": onomatopoeia_name, "count": count})
#             except ObjectDoesNotExist:
#                 pass
#
#     def getResult(self):
#         """
#         This method returns result list([{"name":"xxx", "count":y},{...},{...}).
#         :return: Result list.
#         """
#         return self.result

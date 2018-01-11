from django.http import JsonResponse
from rest_framework import viewsets
from rest_framework_jwt.serializers import User
from FiNote_API.v1.movie_serializer import *
from rest_framework.response import Response

# [0]: GetSearchMovieTitleResultsViewSet
# [1]: GetOriginalTitleViewSet
# test_flag = [False, False]


class GetMoviesViewSet(viewsets.ViewSet):
    serializer_class = GetMoviesSerializer

    def list(self, request):
        if not 'user_id' in request.GET:
            raise serializers.ValidationError('user_idが含まれていません')


        user_id = request.GET.get('user_id')
        movies = Movie_User.objects.filter(user_id=user_id).order_by('-created_at')
        movies_dvd_fav = DVDFAV.objects.filter(user=user_id).order_by('-created_at')

        results = []

        for movie, dvdfav in zip(movies, movies_dvd_fav):
            results.append({
                'title': movie.movie.title,
                'id': movie.movie.tmdb_id,
                'add': movie.created_at,
                'poster':  movie.movie.poster,
                'dvd': dvdfav.dvd,
                'fav': dvdfav.fav
            })

        return Response({'results': results})




#
# class AddMovieViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = AddMovieSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When MovieAdd api access, run this method.
#         This method adds movie, onomatopoeia and genre. If success all process, response genre id and name.
#         :param request: Request user's data.(username, movie_title, overview,
#                                              movie_id(tmdb_id), genre_id_list,
#                                              onomatopoeia, dvd and fav)
#         :return: Genre id and name json data.
#
#         :type request object
#         """
#
#         if request.method == 'POST':
#             r_genre_id_list = request.data['genre_id_list']
#             r_onomatopoeia_list = request.data['onomatopoeia']
#
#             # ジャンルの登録とpkの取得
#             if not r_genre_id_list:
#                 r_genre_id_list = []
#
#             if type(r_genre_id_list) is str:
#                 r_genre_id_list = conversion_str_to_list(r_genre_id_list, 'int')
#             elif type(r_genre_id_list) is not list:
#                 raise ValidationError('不正な形式です')
#
#             genre_obj_dict, genre_obj_list = get_or_create_genre(r_genre_id_list)
#
#             # オノマトペの登録とpkの取得
#             if type(r_onomatopoeia_list) is str:
#                 r_onomatopoeia_list = conversion_str_to_list(r_onomatopoeia_list, 'str')
#             elif type(r_onomatopoeia_list) is not list:
#                 raise ValidationError('不正な形式です')
#
#             onomatopoeia_obj_list = get_or_create_onomatopoeia(r_onomatopoeia_list)
#
#             # 映画の保存
#             data = {'username': request.data['username'],
#                     'movie_title': request.data['movie_title'],
#                     'movie_id': request.data['movie_id'],
#                     'overview': request.data['overview'],
#                     'poster_path': request.data['poster_path']
#                     }
#
#             add_movie(genre_obj_list, onomatopoeia_obj_list, data)
#
#             # バックアップの保存
#             backup_data = {'username': request.data['username'],
#                            'movie_id': request.data['movie_id'],
#                            'onomatopoeia_obj_list': onomatopoeia_obj_list,
#                            'dvd': request.data['dvd'],
#                            'fav': request.data['fav']
#                            }
#
#             movieadd_backup(backup_data)
#
#             return JsonResponse(genre_obj_dict)
#
#
# class UpdateOnomatopoeiaViewSet(viewsets.ViewSet):
#     queryset = Onomatopoeia.objects.all()
#     serializer_class = UpdateOnomatopoeiaSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When OnomatopoeiaUpdate api access, run this method.
#         This method updates movie and back up table onomatopoeia column or add onomatopoeia.
#         If success all process, response user name.
#         :param request: Request user's data.(username, movie_id(tmdb_id) and onomatopoeia list)
#         :return: User name.
#
#         :type request object
#         """
#
#         serializer = UpdateOnomatopoeiaSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             r_onomatopoeia_list = request.data['onomatopoeia']
#
#             if type(r_onomatopoeia_list) is str:
#                 r_onomatopoeia_list = conversion_str_to_list(r_onomatopoeia_list, 'str')
#             elif type(request.data['onomatopoeia']) is not list:
#                 raise ValidationError('不正な形式です')
#
#             # Movieテーブルのオノマトペカラムに新規追加(削除はしない)
#             onomatopoeia_obj_list = movie_update_onomatopoeia(request.data, r_onomatopoeia_list)
#
#             # BackUpテーブルのオノマトペカラムに上書き(削除と追加)
#             onomatopoeia_update_backup(request.data, onomatopoeia_obj_list)
#
#             return Response(request.data['username'])
#
#         else:
#             return Response(serializer.error_messages)
#
#
# class DeleteBackupViewSet(viewsets.ViewSet):
#     queryset = BackUp.objects.all()
#     serializer_class = DeleteBackupSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When DeleteBackup api access, run this method.
#         This method deletes backup data, remove movie table's user column.
#         :param request: Request user's data.(username and movie_id(tmdb_id))
#         :return: User name.
#
#         :type request object
#         """
#
#         serializer = DeleteBackupSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             # バックアップの削除
#             try:
#                 usr_obj = AuthUser.objects.get(username=request.data['username'])
#                 movie_obj = Movie.objects.get(tmdb_id=request.data['movie_id'])
#                 backup_obj = BackUp.objects.filter(username=usr_obj, movie=movie_obj)
#                 backup_obj.delete()
#
#                 # Movieテーブルの該当レコードのuserカラムからユーザとの関連を削除
#                 if movie_obj.user.all().filter(username=usr_obj).exists():
#                     movie_obj.user.remove(usr_obj)
#
#                 return Response(request.data['username'])
#             except ObjectDoesNotExist:
#                 raise ValidationError('該当するデータが見つかりませんでした')
#         else:
#             return Response(serializer.error_messages)
#
#
# class UpdateStatusViewSet(viewsets.ViewSet):
#     queryset = AuthUser.objects.all()
#     serializer_class = UpdateStatusSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When StatusUpdate api access, run this method.
#         This method updates dvd and favorite status.
#         :param request: Request user's data.(username, movie_id(tmdb_id), dvd and fav)
#         :return: User name.
#
#         :type request object
#         """
#
#         serializer = UpdateStatusSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             try:
#                 usr_obj = AuthUser.objects.get(username=request.data['username'])
#                 movie_obj = Movie.objects.get(tmdb_id=request.data['movie_id'])
#                 BackUp.objects.filter(username=usr_obj, movie=movie_obj) \
#                     .update(dvd=request.data['dvd'], fav=request.data['fav'])
#             except ObjectDoesNotExist:
#                 raise ValidationError('該当するデータが見つかりませんでした')
#
#             return Response(request.data['username'])
#         else:
#             return Response(serializer.error_messages)
#
#
# class GetRecentlyMovieViewSet(viewsets.ModelViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetRecentlyMovieSerializer
#     http_method_names = ['get']
#
#     def list(self, request, *args, **kwargs):
#         """
#         When RecentlyMovie api access, run this method.
#         This method gets recently updated and many users movies.
#         :param request: This param is not used.
#         :param args: This param is not used.
#         :param kwargs: This param is not used.
#         :return: Recently updated and many users movies.
#         """
#
#         today = datetime.date.today() + datetime.timedelta(days=1)
#         one_week_ago = today - datetime.timedelta(days=7)
#
#         queryset = Movie.objects.annotate(user_count=Count('user')) \
#                        .filter(updated_at__range=(one_week_ago, today), user_count__gt=1) \
#                        .order_by('-user_count', '-updated_at')[:200].values()
#
#         serializer = GetRecentlyMovieSerializer(queryset, many=True)
#
#         return Response(serializer.data)
#
#
# class MovieUserCount(object):
#     def __init__(self, movie):
#         """
#         Management class that movie and user counts by age.
#         :param movie: Target a movie.
#         """
#
#         self.movie = movie
#         self.count_10 = 0
#         self.count_20 = 0
#         self.count_30 = 0
#         self.count_40 = 0
#         self.count_50 = 0
#
#
# class GetMovieByAgeViewSet(viewsets.ModelViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetMovieByAgeSerializer
#     http_method_names = ['get']
#
#     def list(self, request, *args, **kwargs):
#         """
#         When MovieByAge api access, run this method.
#         This method gets user counts and age movies.
#         :param request: This param is not used.
#         :param args: This param is not used.
#         :param kwargs: This param is not used.
#         :return: User counts desc movies by age.
#         """
#
#         movies = Movie.objects.annotate(user_count=Count('user')).filter(user_count__gt=1).order_by('-user_count')[:15]
#
#         # 該当映画と年代別の登録数のクラスをリストに格納
#         count_class_list = []
#         for movie in movies:
#             tmp_count_class = MovieUserCount(movie)
#
#             for user in movie.user.all():
#                 self.update_movie_count_class(tmp_count_class, user.birthday)
#
#             count_class_list.append(tmp_count_class)
#
#         # ユーザの登録数が多い順にソート
#         sorted_count_class_list_10 = sorted(count_class_list, key=attrgetter('count_10'), reverse=True)
#         sorted_count_class_list_20 = sorted(count_class_list, key=attrgetter('count_20'), reverse=True)
#         sorted_count_class_list_30 = sorted(count_class_list, key=attrgetter('count_30'), reverse=True)
#         sorted_count_class_list_40 = sorted(count_class_list, key=attrgetter('count_40'), reverse=True)
#         sorted_count_class_list_50 = sorted(count_class_list, key=attrgetter('count_50'), reverse=True)
#         sorted_list_collection = [sorted_count_class_list_10,
#                                   sorted_count_class_list_20,
#                                   sorted_count_class_list_30,
#                                   sorted_count_class_list_40,
#                                   sorted_count_class_list_50]
#
#         # dictionaryを作成
#         res = []
#         for i, sorted_count_class_list in enumerate(sorted_list_collection):
#             dict_list_tmp = []
#             for sorted_count_class in sorted_count_class_list:
#                 dict_tmp = {"title": sorted_count_class.movie.title,
#                             "overview": sorted_count_class.movie.overview,
#                             "poster_path": sorted_count_class.movie.poster_path,
#                             "10": sorted_count_class.count_10,
#                             "20": sorted_count_class.count_20,
#                             "30": sorted_count_class.count_30,
#                             "40": sorted_count_class.count_40,
#                             "50": sorted_count_class.count_50}
#
#                 dict_list_tmp.append(dict_tmp)
#
#             res.append({str((i + 1) * 10): dict_list_tmp})
#
#         return Response(res)
#
#     @staticmethod
#     def update_movie_count_class(count_class, birth_year):
#         """
#         This method updates age count in count_class.
#         :param count_class: Custom management class.
#         :param birth_year: User's birth year.
#         :return: Nothing.
#
#         :type count_class class object
#         :type birth_year int
#         """
#
#         this_year = datetime.date.today().year
#
#         if birth_year > this_year - 10 or birth_year in range(this_year - 19, this_year - 9):
#             count_class.count_10 += 1
#
#         elif birth_year in range(this_year - 29, this_year - 19):
#             count_class.count_20 += 1
#
#         elif birth_year in range(this_year - 39, this_year - 29):
#             count_class.count_30 += 1
#
#         elif birth_year in range(this_year - 49, this_year - 39):
#             count_class.count_40 += 1
#
#         else:
#             count_class.count_50 += 1
#
#
# class GetMovieReactionViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetMovieReactionSerializer
#
#     @staticmethod
#     def create(request):
#
#         """
#         When MovieReaction api access, run this method.
#         This method gets onomatopoeia and count.
#         :param request: Target tmdb_id list.
#         :return: Onomatopoeia name group by tmdb_id.
#         """
#
#         serializer = GetMovieReactionSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             tmdb_id_list = conversion_str_to_list(request.data['tmdb_id_list'], 'int')
#             res = []
#
#             thread_list = []
#             for tmdb_id in tmdb_id_list:
#                 thread = GetMovieReactionThread(tmdb_id)
#                 thread_list.append(thread)
#                 thread.start()
#
#             # 全てのスレッドが完了するまで待機(ブロック)
#             for thread in thread_list:
#                 thread.join()
#
#             for thread in thread_list:
#                 res.append(thread.getResult())
#
#             return Response(res)
#
#         else:
#             raise ValidationError('正しいパラメータ値ではありません')
#
#
# class GetMovieByOnomatopoeiaViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetMovieByOnomatopoeiaSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When GetMovieByOnomatopoeia api access, run this method.
#         This method gets movies that include target onomatopoeia.
#         :param request: Target onomatopoeia.
#         :return: Hit movies information(title, overview and poster_path).
#         """
#
#         serializer = GetMovieByOnomatopoeiaSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             # リクエスト文字を含むオノマトペを取得
#             onomatopoeia_name = request.data['onomatopoeia_name']
#             onomatopoeia_list = Onomatopoeia.objects.filter(name__contains=onomatopoeia_name)
#
#             # 上記で取得したオノマトペを含む映画を取得
#             movie_list = []
#             for onomatopoeia in onomatopoeia_list:
#                 movies = Movie.objects.filter(onomatopoeia=onomatopoeia)
#                 movie_list += list(movies)
#
#             # 映画の情報をdictとして生成
#             res = []
#             for movie in movie_list:
#                 res.append({"title": movie.title,
#                             "overview": movie.overview,
#                             "poster_path": movie.poster_path})
#
#             return Response(res)
#         else:
#             raise ValidationError('必要なパラメータが含まれていません')
#
#
#
#
# class GetSearchMovieTitleResultsViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetSearchMovieTitleResultsSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When GetSearchMovieTitleResults api access, run this method.
#         This method gets search results in yahoo movie website.
#         :param request: Search movie title and page number.
#         :return: Movie's title, movie's id and total results count.
#         """
#
#         serializer = GetSearchMovieTitleResultsSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             res = []
#
#             context = ssl._create_unverified_context()
#             url, param = get_url_param(test_flag[0], 'search', request.data)
#             html = urllib.request.urlopen(url + '?' + urllib.parse.urlencode(param), context=context)
#             soup = BeautifulSoup(html, "html.parser")
#
#             # 検索結果の合計件数を抽出
#             srchform_div = soup.find(id='srchform')
#             srchform_div_label = srchform_div.find(class_='label')
#
#             # 検索結果が0の場合はこの時点で結果を返す
#             if srchform_div_label is None:
#                 return Response({'total': 0, 'results': []})
#
#             small_list = srchform_div_label.find_all('small')
#             del small_list[0]
#
#             match = re.findall(r'[0-9]+', small_list[0].string)
#             total_resutls_count = int(match[0])
#
#             # 映画のタイトルとIDを抽出
#             lst = soup.find(id='lst')
#             li_tag_list = lst.find_all('li', class_='col')
#
#             title_id_list = []
#             for li_tag in li_tag_list:
#                 title = li_tag.find('h3', class_='text-xsmall text-overflow').attrs['title']
#                 id = li_tag.attrs['data-cinema-id']
#                 title_id_list.append({'title': title, 'id': id})
#
#             res.append({'total': total_resutls_count})
#             res.append({'results': title_id_list})
#
#             return Response({'total': total_resutls_count, 'results': title_id_list})
#
#         else:
#             raise ValidationError('正しいパラメータ値ではありません')
#
#
# class GetOriginalTitleViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetOriginalTitleSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When GetOriginalTitle api access, run this method.
#         This method gets original movie title in yahoo movie website.
#         :param request: Search movie title and id number.
#         :return: Movie's original title.
#         """
#
#         serializer = GetOriginalTitleSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             original_title = ''
#
#             context = ssl._create_unverified_context()
#             url, param = get_url_param(test_flag[1], 'origin', request.data)
#             html = urllib.request.urlopen(url + '?' + urllib.parse.urlencode(param), context=context)
#             soup = BeautifulSoup(html, "html.parser")
#
#             mvinf = soup.find(id='mvinf')
#             tr_tag_list = mvinf.find_all('tr')
#
#             # 製作国が日本以外なら保存した原題を返す
#             for tr_tag in tr_tag_list:
#                 th_tag = tr_tag.find('th')
#
#                 if th_tag.string == '原題':
#                     original_title = tr_tag.find('td').string
#                     continue
#
#                 if th_tag.string == '製作国':
#                     if tr_tag.find('li').string != '日本':
#                         return Response(original_title)
#                     break
#
#             return Response('')
#         else:
#             raise ValidationError('正しいパラメータ値ではありません')
#
#
# class GetOnomatopoeiaCountByMovieIDViewSet(viewsets.ViewSet):
#     queryset = Movie.objects.all()
#     serializer_class = GetOnomatopoeiaCountByMovieIDSerializer
#
#     @staticmethod
#     def create(request):
#         """
#         When GetOnomatopoeiaCountByMovieID api access, run this method.
#         This method gets onomatopoeia count in movie.
#         :param request: Target movie id and onomatopoeia names.
#         :return: Onomatopoeia name and count.
#         """
#
#         serializer = GetOnomatopoeiaCountByMovieIDSerializer(data=request.data)
#
#         if serializer.is_valid() and request.method == 'POST':
#             onomatopoeia_name_list = conversion_str_to_list(request.data['onomatopoeia_name_list'], 'str')
#             movie = Movie.objects.get(tmdb_id=request.data['tmdb_id'])
#
#             # 200よりリクエストされたオノマトペが少なければ最後までslice、それ以外なら20で割った分だけslice
#             if len(onomatopoeia_name_list) < 200:
#                 s = 0
#                 e = len(onomatopoeia_name_list)
#
#             else:
#                 s = 0
#                 e = int(len(onomatopoeia_name_list) / 20)  # MySQLの同時接続数が20のため
#
#             sliced = onomatopoeia_name_list[s:e]
#             thread_list = []
#
#             while len(sliced) != 0:
#                 thread = GetOnomatopoeiaCountByMovieIDThread(movie, sliced)
#                 thread_list.append(thread)
#                 thread.start()
#
#                 # スライス箇所の更新
#                 s = e
#                 e += e
#                 sliced = onomatopoeia_name_list[s:e]
#
#             # 全てのスレッドが完了するまで待機(ブロック)
#             for thread in thread_list:
#                 thread.join()
#
#             res = []
#             for thread in thread_list:
#                 if len(thread.getResult()) != 0:
#                     res.extend(thread.getResult())
#
#             return Response(res)
#
#         else:
#             raise ValidationError('正しいパラメータ値ではありません')

from FiNote_API.utility import *
from rest_framework import viewsets
from FiNote_API.v1.movie_serializer import *
from rest_framework.response import Response
from django.db.models import F

# [0]: GetSearchMovieTitleResultsViewSet
# [1]: GetOriginalTitleViewSet
# test_flag = [False, False]


class GetMoviesViewSet(viewsets.ViewSet):
    def list(self, request):
        if not 'user_id' in request.GET:
            raise serializers.ValidationError('user_idが含まれていません')


        user_id = request.GET.get('user_id')

        try:
            user = AuthUser.objects.get(pk=user_id)
        except:
            raise serializers.ValidationError('該当データが見つかりませんでした')

        movie_user = Movie_User.objects.filter(user=user).order_by('-created_at')

        # 映画ごとにDVD,FAV、オノマトペを取得
        dvdfav = []
        onomatopoeia = []
        for movie_user_obj in movie_user:
            dvdfav.append(DVDFAV.objects.get(movie_user=movie_user_obj))
            onomatopoeia.append(MovieUserOnomatopoeia.objects.filter(movie_user=movie_user_obj))

        results = []

        for movie_user_obj, dvdfav_obj, onomatopoeia_list in zip(movie_user, dvdfav, onomatopoeia):
            onomatopoeia_name_list = [movie_user_onomatopoeia.onomatopoeia.name for movie_user_onomatopoeia in onomatopoeia_list]

            results.append({
                'title': movie_user_obj.movie.title,
                'id': movie_user_obj.movie.tmdb_id,
                'add': movie_user_obj.created_at,
                'poster':  movie_user_obj.movie.poster,
                'dvd': dvdfav_obj.dvd,
                'fav': dvdfav_obj.fav,
                'onomatopoeia': onomatopoeia_name_list
            })

        return Response({'results': results})


class UpdateDVDFAVViewSet(viewsets.ViewSet):
    serializer_class = UpdateDVDFAVSerializer

    @staticmethod
    def create(request):

        data = request.data
        serializer = UpdateDVDFAVSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data['username'])
                movie = Movie.objects.get(tmdb_id=data['tmdb_id'])
                movie_user = Movie_User.objects.get(movie=movie, user=user)
            except:
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            if not user.check_password(data['password'].encode('utf-8')):
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            movie_user.dvd = data['dvd']
            movie_user.fav = data['fav']
            movie_user.save()

            return Response({'dvd': data['dvd'], 'fav': data['fav']})
        else:
            raise serializers.ValidationError(serializer.errors)


#
class AddMovieViewSet(viewsets.ViewSet):
    serializer_class = AddMovieSerializer

    @staticmethod
    def create(request):

        data = request.data
        serializer = AddMovieSerializer(data=data)

        if not (serializer.is_valid() and request.method == 'POST'):
            raise serializers.ValidationError(serializer.errors)

        try:
            user = AuthUser.objects.get(username=data['username'])
        except:
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        if not user.check_password(data['password'].encode('utf-8')):
            raise serializers.ValidationError('該当するデータが見つかりませんでした')

        # ジャンルの登録とオブジェクトの取得
        genre_obj_list = get_or_create_genre(data['genre'])

        # オノマトペの登録とオブジェクトの取得
        onomatopoeia_obj_list = []
        for onomatopoeia in data['onomatopoeia']:
            obj, created = Onomatopoeia.objects.get_or_create(
                name=onomatopoeia,
                defaults={'name': onomatopoeia}
            )

            onomatopoeia_obj_list.append(obj)

        # 映画オブジェクトの新規追加 or 取得
        movie_obj, created_movie = Movie.objects.get_or_create(
            tmdb_id=data['tmdb_id'],
            defaults={'title': data['title'],
                      'tmdb_id': data['tmdb_id'],
                      'overview': data['overview'],
                      'poster': data['poster']}
        )

        # 追加した映画にジャンルがなければ新規追加
        for genre_obj in genre_obj_list:
            if not movie_obj.genre.all().filter(name=genre_obj.name).exists():
                movie_obj.genre.add(genre_obj)

        # 追加した映画にオノマトペがあればカウント更新
        # なければ新規追加
        for onomatopoeia_obj in onomatopoeia_obj_list:
            if movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
                Movie_Onomatopoeia.objects.filter(
                    movie=movie_obj, onomatopoeia=onomatopoeia_obj
                ).update(count=F('count') + 1)
            else:
                Movie_Onomatopoeia(movie=movie_obj, onomatopoeia=onomatopoeia_obj).save()

        movie_obj.save()

        # 追加した映画にユーザを新規追加
        movie_user, created_movie_user = Movie_User.objects.get_or_create(
            movie=movie_obj, user=user,
            defaults={'movie': movie_obj, 'user': user, 'dvd': data['dvd'], 'fav': data['fav']}
        )

        # movie user onomatopoeiaの保存
        if created_movie_user:
            for onomatopoeia_obj in onomatopoeia_obj_list:
                Movie_User_Onomatopoeia(movie_user=movie_user, onomatopoeia=onomatopoeia_obj).save()

        return Response({'msg': 'success'})


class UpdateOnomatopoeiaViewSet(viewsets.ViewSet):
    serializer_class = UpdateOnomatopoeiaSerializer

    @staticmethod
    def create(request):

        data = request.data
        serializer = UpdateOnomatopoeiaSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            try:
                user = AuthUser.objects.get(username=data['username'])
            except:
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            if not user.check_password(data['password'].encode('utf-8')):
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            movie_obj = Movie.objects.get(tmdb_id=data['tmdb_id'])

            # movie onomatopoeia userの該当するレコードを削除
            movie_user = Movie_User.objects.get(user=user, movie=movie_obj)
            MovieUserOnomatopoeia.objects.filter(movie_user=movie_user).delete()

            # オノマトペがなければ新規作成
            for onomatopoeia_name in data['onomatopoeia']:
                onomatopoeia_obj, created = Onomatopoeia.objects.get_or_create(
                    name=onomatopoeia_name,
                    defaults={'name': onomatopoeia_name}
                )

                if not movie_obj.onomatopoeia.all().filter(name=onomatopoeia_obj.name).exists():
                    Movie_Onomatopoeia(movie=movie_obj, onomatopoeia=onomatopoeia_obj).save()

                # オノマトペカウントオブジェクトの新規追加 or 取得
                onomatopoeia_count_obj, created_oc = OnomatopoeiaCount.objects.get_or_create(
                    onomatopoeia=onomatopoeia_obj,
                    movie=movie_obj,
                    defaults={'count': 1, 'onomatopoeia': onomatopoeia_obj, 'movie': movie_obj}
                )

                # オノマトペカウントオブジェクトの更新
                if not created_oc:
                    onomatopoeia_count_obj.count += 1
                    onomatopoeia_count_obj.save()

                # movie user onomatopoeiaの保存
                MovieUserOnomatopoeia(movie_user=movie_user, onomatopoeia=onomatopoeia_obj).save()

            return Response({'msg': 'success'})

        else:
            raise serializers.ValidationError(serializer.errors)


class DeleteMovieViewSet(viewsets.ViewSet):
    serializer_class = DeleteMovieSerializer

    @staticmethod
    def create(request):

        data = request.data
        serializer = DeleteMovieSerializer(data=data)

        if serializer.is_valid() and request.method == 'POST':
            # バックアップの削除
            try:
                user = AuthUser.objects.get(username=data['username'])
#
#                 # Movieテーブルの該当レコードのuserカラムからユーザとの関連を削除
#                 if movie_obj.user.all().filter(username=usr_obj).exists():
#                     movie_obj.user.remove(usr_obj)
#
                # return Response(data['username'])
            except:
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            if not user.check_password(data['password'].encode('utf-8')):
                raise serializers.ValidationError('該当するデータが見つかりませんでした')

            movie_obj = Movie.objects.get(tmdb_id=data['tmdb_id'])
            # movieからユーザ削除
            #

        else:
            return serializers.ValidationError(serializer.errors)


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
